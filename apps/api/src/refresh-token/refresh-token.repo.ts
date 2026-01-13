import camelcaseKeys from 'camelcase-keys'

import { Query } from '../db/db.types.js'
import { sql } from '../pg/pg-sql-tag.js'
import { UserId } from '../user/user.schema.js'

export class RefreshTokenRepo {
  constructor(private readonly query: Query) {}

  async create(input: {
    userId: UserId
    token: string
    expiresAt: Date
  }): Promise<void> {
    const { userId, token, expiresAt } = input

    const result = await this.query(
      sql`
        INSERT INTO refresh_tokens (user_id, token, expires_at)
          VALUES (${userId}, ${token}, ${expiresAt})
      `,
      'refresh_token_create',
    )

    if (result.rowCount !== 1) {
      throw new Error('Invalid refresh token creation.')
    }
  }

  async revoke(refreshToken: string): Promise<void> {
    await this.query(
      sql`
        UPDATE
          refresh_tokens
        SET
          revoked_at = now(),
          updated_at = now()
        WHERE
          token = ${refreshToken}
          AND revoked_at IS NULL
      `,
      'refresh_token_revoke',
    )
  }

  async lock(refreshToken: string): Promise<{ expiresAt: string } | null> {
    const result = await this.query<{ expires_at: string }>(
      sql`
        SELECT
          expires_at
        FROM
          refresh_tokens
        WHERE
          token = ${refreshToken}
          AND revoked_at IS NULL
        FOR UPDATE
      `,
      'refresh_token_lock',
    )

    if (result.rows.length !== 1) {
      return null
    }

    return camelcaseKeys(result.rows[0])
  }
}
