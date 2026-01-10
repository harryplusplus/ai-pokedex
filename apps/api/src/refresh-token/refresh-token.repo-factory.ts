import { Injectable } from '@nestjs/common'
import { Sql } from 'postgres'
import { Scannable } from '../component-scan/scannable.decorator.js'
import { RefreshTokenRepo } from './refresh-token.repo.js'

@Scannable()
@Injectable()
export class RefreshTokenRepoFactory {
  create(sql: Sql): RefreshTokenRepo {
    return new RefreshTokenRepo(sql)
  }
}
