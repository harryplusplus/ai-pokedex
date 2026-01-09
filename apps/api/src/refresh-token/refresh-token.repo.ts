import { Sql } from 'postgres'
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

    const result = await sql`
      INSERT INTO refresh_tokens (user_id, token, expires_at)
        VALUES (${userId}, ${token}, ${expiresAt})
    `

    if (result.count !== 1) {
      throw new Error('Invalid refresh token creation.')
    }
  }

  async revoke(refreshToken: string): Promise<void> {
    const { sql } = this

    await sql`
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

    const result = await sql<{ expiresAt: string }[]>`
      SELECT
        expires_at
      FROM
        refresh_tokens
      WHERE
        token = ${refreshToken}
        AND revoked_at IS NULL
      FOR UPDATE
    `

    if (result.length === 0) {
      return null
    }

    return result[0]
  }
}
