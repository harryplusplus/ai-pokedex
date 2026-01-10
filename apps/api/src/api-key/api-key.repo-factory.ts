import { Injectable } from '@nestjs/common'
import { Sql } from 'postgres'
import { Scannable } from '../component-scan/scannable.decorator.js'
import { ApiKeyRepo } from './api-key.repo.js'

@Scannable()
@Injectable()
export class ApiKeyRepoFactory {
  create(sql: Sql) {
    return new ApiKeyRepo(sql)
  }
}
