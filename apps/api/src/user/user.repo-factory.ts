import { Injectable } from '@nestjs/common'
import { Scannable } from 'nest-component-scan'
import { Sql } from 'postgres'

import { UserRepo } from './user.repo.js'

@Scannable()
@Injectable()
export class UserRepoFactory {
  create(sql: Sql): UserRepo {
    return new UserRepo(sql)
  }
}
