import { Sql } from 'postgres'
import { ApiKey } from './api-key.schema.js'

export class ApiKeyRepo {
  constructor(private readonly sql: Sql) {}

  async validate(apiKey: ApiKey): Promise<boolean> {
    const { sql } = this
    const result = await sql`
      SELECT
          *
      FROM
          api_keys
      WHERE
          api_key = ${apiKey}
          AND is_enabled = TRUE
    `

    return result.count === 1
  }
}
