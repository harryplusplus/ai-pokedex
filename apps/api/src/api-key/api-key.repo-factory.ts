import { Injectable } from '@nestjs/common'
import { Sql } from 'postgres'
import { ApiKeyRepo } from './api-key.repo.js'

@Injectable()
export class ApiKeyRepoFactory {
  newRepo(sql: Sql) {
    return new ApiKeyRepo(sql)
  }
}
