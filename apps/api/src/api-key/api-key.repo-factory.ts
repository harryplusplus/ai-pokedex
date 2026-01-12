import { Injectable } from '@nestjs/common'
import { Scannable } from 'nest-component-scan'
import { Sql } from 'postgres'

import { ApiKeyRepo } from './api-key.repo.js'

@Scannable()
@Injectable()
export class ApiKeyRepoFactory {
  create(sql: Sql) {
    return new ApiKeyRepo(sql)
  }
}
