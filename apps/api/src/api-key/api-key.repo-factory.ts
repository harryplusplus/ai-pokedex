import { Injectable } from '@nestjs/common'
import { Sql } from 'postgres'
import { ApiKeyRepo } from './api-key.repo.js'

@Injectable()
export class ApiKeyRepoFactory {
  create(sql: Sql) {
    return new ApiKeyRepo(sql)
  }
}
