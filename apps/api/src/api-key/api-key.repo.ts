import { TransactionSql } from 'postgres'
import { ApiKey } from './api-key.schema.js'

export class ApiKeyRepo {
  constructor(private readonly sql: TransactionSql) {}

  async validate(apiKey: ApiKey) {
    const res = await this.sql`
    
                select * from 
    
    api_keys`
  }
}
