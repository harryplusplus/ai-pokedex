import { Sql } from 'postgres'
import { UserId } from './user.schema.js'

export class UserRepo {
  constructor(private readonly sql: Sql) {}

  async signIn(input: {
    provider: string
    providerUserId: string
  }): Promise<{ id: UserId }> {
    const { provider, providerUserId } = input
    const { sql } = this

    const result = await sql`
      INSERT INTO users (provider, provider_user_id)
        VALUES (${provider}, ${providerUserId})
      ON CONFLICT (provider, provider_user_id)
        DO UPDATE SET
          last_sign_in_at = now(),
          updated_at = now()
        RETURNING
          id
    `

    if (result.length === 0) {
      throw new Error('Invalid signIn query.')
    }

    return result[0] as { id: UserId }
  }
}
