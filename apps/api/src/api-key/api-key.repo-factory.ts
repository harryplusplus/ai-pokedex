import { Injectable } from '@nestjs/common'
import { Sql } from 'postgres'
import { ProvidedIn } from '../provided-in/provided-in.decorator.js'
import { ApiKeyRepo } from './api-key.repo.js'

@ProvidedIn()
@Injectable()
export class ApiKeyRepoFactory {
  create(sql: Sql) {
    return new ApiKeyRepo(sql)
  }
}
