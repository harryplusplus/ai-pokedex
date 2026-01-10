import { Injectable } from '@nestjs/common'
import { Sql } from 'postgres'
import { ProvidedIn } from '../provided-in/provided-in.decorator.js'
import { RefreshTokenRepo } from './refresh-token.repo.js'

@ProvidedIn()
@Injectable()
export class RefreshTokenRepoFactory {
  create(sql: Sql): RefreshTokenRepo {
    return new RefreshTokenRepo(sql)
  }
}
