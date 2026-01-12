import { Injectable } from '@nestjs/common'
import { Scannable } from 'nest-component-scan'

import { DbService } from '../db/db.service.js'
import { ApiKeyRepoFactory } from './api-key.repo-factory.js'
import { ApiKey } from './api-key.schema.js'

@Scannable()
@Injectable()
export class ApiKeyService {
  constructor(
    private readonly dbService: DbService,
    private readonly apiKeyRepoFactory: ApiKeyRepoFactory,
  ) {}

  async validate(apiKey: ApiKey): Promise<boolean> {
    return await this.apiKeyRepoFactory
      .create(this.dbService.sql)
      .validate(apiKey)
  }
}
