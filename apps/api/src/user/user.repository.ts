import { sql } from '../db/db.utils.ts'
import { QueryClient } from '../db/query.client.ts'
import { UserId } from './user.schema.js'

export class UserRepository {
  constructor(private readonly queryClient: QueryClient) {}

  async createOrGetId(input: {
    provider: string
    providerUserId: string
  }): Promise<UserId> {
    const { provider, providerUserId } = input

    const result = await this.queryClient.query<{ id: UserId }>(sql`
      INSERT INTO users (provider, provider_user_id)
        VALUES (${provider}, ${providerUserId})
      ON CONFLICT (provider, provider_user_id)
      WHERE
        deleted_at IS NULL
          DO UPDATE SET
            last_sign_in_at = now(),
            updated_at = now()
          RETURNING
            id
    `)

    if (result.rows.length === 0) {
      throw new Error('Invalid result.')
    }

    return result.rows[0].id
  }
}
