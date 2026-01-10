import { Injectable } from '@nestjs/common'
import { Scannable } from '@repo/nest-component-scan'
import { Sql } from 'postgres'
import { RefreshTokenRepo } from './refresh-token.repo.js'

@Scannable()
@Injectable()
export class RefreshTokenRepoFactory {
  create(sql: Sql): RefreshTokenRepo {
    return new RefreshTokenRepo(sql)
  }
}
