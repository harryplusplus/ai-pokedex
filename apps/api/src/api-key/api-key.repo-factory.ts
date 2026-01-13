import { Injectable } from '@nestjs/common'
import { Scannable } from 'nest-component-scan'

import { Query } from '../db/db.types.js'
import { ApiKeyRepo } from './api-key.repo.js'

@Scannable()
@Injectable()
export class ApiKeyRepoFactory {
  create(query: Query) {
    return new ApiKeyRepo(query)
  }
}
