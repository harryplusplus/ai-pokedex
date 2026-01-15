import { Injectable } from '@nestjs/common'
import { Scannable } from 'nest-component-scan'

import { DbService } from '../db/db.service.ts'
import { ApiKey } from './api-key.schema.ts'

@Scannable()
@Injectable()
export class ApiKeyService {
  constructor(private readonly dbService: DbService) {}

  async validate(apiKey: ApiKey): Promise<boolean> {
    return await this.dbService.client.apiKey.validate(apiKey)
  }
}
