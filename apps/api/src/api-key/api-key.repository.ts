import { sql } from '../db/db.utils.ts'
import { QueryClient } from '../db/query.client.ts'
import { ApiKey } from './api-key.schema.ts'

export class ApiKeyRepository {
  constructor(private readonly client: QueryClient) {}

  async validate(apiKey: ApiKey): Promise<boolean> {
    const result = await this.client.query<{ id: number }>(sql`
      SELECT
        id
      FROM
        api_keys
      WHERE
        key = ${apiKey}
        AND revoked_at IS NULL
    `)

    return result.rowCount === 1
  }
}
