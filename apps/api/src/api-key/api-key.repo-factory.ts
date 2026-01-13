import { Injectable } from '@nestjs/common'
import { Scannable } from 'nest-component-scan'

import { Client } from '../db/db.types.js'
import { ApiKeyRepo } from './api-key.repo.js'

@Scannable()
@Injectable()
export class ApiKeyRepoFactory {
  create(client: Client) {
    return new ApiKeyRepo(client)
  }
}
