import { Sql } from '../pg/pg-sql.js'
import { ApiKey } from './api-key.schema.js'

export class ApiKeyRepo {
  constructor(private readonly sql: Sql) {}

  async validate(apiKey: ApiKey): Promise<boolean> {
    const { sql } = this

    const result = await sql<{ id: number }>`
      SELECT
        id
      FROM
        api_keys
      WHERE
        key = ${apiKey}
        AND revoked_at IS NULL
    `

    return result.rowCount === 1
  }
}
