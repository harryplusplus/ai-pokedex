import { Injectable } from '@nestjs/common'
import { DbService } from '../db/db.service.js'
import { ApiKeyRepoFactory } from './api-key.repo-factory.js'
import { ApiKey } from './api-key.schema.js'

@Injectable()
export class ApiKeyService {
  constructor(
    private readonly dbService: DbService,
    private readonly apiKeyRepoFactory: ApiKeyRepoFactory,
  ) {}

  async validate(apiKey: ApiKey): Promise<boolean> {
    return await this.apiKeyRepoFactory
      .newRepo(this.dbService.sql)
      .validate(apiKey)
  }
}
