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
}
