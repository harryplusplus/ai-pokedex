import camelcaseKeys from 'camelcase-keys'

import { prepare } from '../db/db.types.js'
import { Sql } from '../pg/pg-sql.js'
import { UserId } from '../user/user.schema.js'

export class RefreshTokenRepo {
  constructor(private readonly sql: Sql) {}

  async create(input: {
    userId: UserId
    token: string
    expiresAt: Date
  }): Promise<void> {
    const { userId, token, expiresAt } = input
    const { sql } = this

    const result = await sql(prepare('refresh_token_create'))`
      INSERT INTO tokens (user_id, token, expires_at)
        VALUES (${userId}, ${token}, ${expiresAt})
    `

    if (result.rowCount !== 1) {
      throw new Error('Invalid refresh token creation.')
    }
  }

  async revoke(refreshToken: string): Promise<void> {
    const { sql } = this

    await sql(prepare('refresh_token_revoke'))`
      UPDATE
        refresh_tokens
      SET
        revoked_at = now(),
        updated_at = now()
      WHERE
        token = ${refreshToken}
        AND revoked_at IS NULL
    `
  }

  async lock(refreshToken: string): Promise<{ expiresAt: string } | null> {
    const { sql } = this

    const result = await sql<{ expires_at: string }>(
      prepare('refresh_token_lock'),
    )`
      SELECT
        expires_at
      FROM
        refresh_tokens
      WHERE
        token = ${refreshToken}
        AND revoked_at IS NULL
      FOR UPDATE
    `

    if (result.rows.length !== 1) {
      return null
    }

    return camelcaseKeys(result.rows[0])
  }
}
