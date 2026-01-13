import { Injectable } from '@nestjs/common'
import { Scannable } from 'nest-component-scan'

import { Sql } from '../pg/pg-sql.js'
import { UserRepo } from './user.repo.js'

@Scannable()
@Injectable()
export class UserRepoFactory {
  create(sql: Sql): UserRepo {
    return new UserRepo(sql)
  }
}
