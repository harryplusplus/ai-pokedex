import { sql } from 'pg-sql-tag'

import { Client } from '../db/db.types.js'
import { ApiKey } from './api-key.schema.js'

export class ApiKeyRepo {
  constructor(private readonly client: Client) {}

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
