import { Injectable } from '@nestjs/common'
import { Scannable } from 'nest-component-scan'

import { Sql } from '../pg/pg-sql.js'
import { RefreshTokenRepo } from './refresh-token.repo.js'

@Scannable()
@Injectable()
export class RefreshTokenRepoFactory {
  create(sql: Sql): RefreshTokenRepo {
    return new RefreshTokenRepo(sql)
  }
}
