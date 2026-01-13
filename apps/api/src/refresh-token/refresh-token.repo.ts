import camelcaseKeys from 'camelcase-keys'
import { sql } from 'pg-sql-tag'

import { Client } from '../db/db.types.js'
import { UserId } from '../user/user.schema.js'

export class RefreshTokenRepo {
  constructor(private readonly client: Client) {}

  async create(input: {
    userId: UserId
    token: string
    expiresAt: Date
  }): Promise<void> {
    const { userId, token, expiresAt } = input

    const result = await this.client.query(sql`
      INSERT INTO refresh_tokens (user_id, token, expires_at)
        VALUES (${userId}, ${token}, ${expiresAt})
    `)

    if (result.rowCount !== 1) {
      throw new Error('Invalid refresh token creation.')
    }
  }

  async revoke(refreshToken: string): Promise<void> {
    await this.client.query(sql`
      UPDATE
        refresh_tokens
      SET
        revoked_at = now(),
        updated_at = now()
      WHERE
        token = ${refreshToken}
        AND revoked_at IS NULL
    `)
  }

  async lock(refreshToken: string): Promise<{ expiresAt: string } | null> {
    const result = await this.client.query<{ expires_at: string }>(sql`
      SELECT
        expires_at
      FROM
        refresh_tokens
      WHERE
        token = ${refreshToken}
        AND revoked_at IS NULL
      FOR UPDATE
    `)

    if (result.rows.length !== 1) {
      return null
    }

    return camelcaseKeys(result.rows[0])
  }
}
