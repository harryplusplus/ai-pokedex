import { Injectable } from '@nestjs/common'
import { Sql } from 'postgres'
import { RefreshTokenRepo } from './refresh-token.repo.js'

@Injectable()
export class RefreshTokenService {
  createRepo(sql: Sql): RefreshTokenRepo {
    return new RefreshTokenRepo(sql)
  }
}
