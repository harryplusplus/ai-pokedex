import { Injectable } from '@nestjs/common'
import { Scannable } from 'nest-component-scan'

import { Sql } from '../pg/pg-sql.js'
import { ApiKeyRepo } from './api-key.repo.js'

@Scannable()
@Injectable()
export class ApiKeyRepoFactory {
  create(sql: Sql) {
    return new ApiKeyRepo(sql)
  }
}
