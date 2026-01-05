import { Injectable } from '@nestjs/common'
import { Sql } from 'postgres'
import { DbService } from '../db/db.service.js'
import { ApiKeyRepo } from './api-key.repo.js'
import { ApiKey } from './api-key.schema.js'

@Injectable()
export class ApiKeyService {
  constructor(private readonly dbService: DbService) {}

  createRepo(sql: Sql): ApiKeyRepo {
    return new ApiKeyRepo(sql)
  }

  async validate(apiKey: ApiKey): Promise<boolean> {
    return await this.createRepo(this.dbService.sql).validate(apiKey)
  }
}
