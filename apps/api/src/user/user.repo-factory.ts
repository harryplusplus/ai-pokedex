import { Injectable } from '@nestjs/common'
import { Scannable } from 'nest-component-scan'

import { Query } from '../db/db.types.js'
import { UserRepo } from './user.repo.js'

@Scannable()
@Injectable()
export class UserRepoFactory {
  create(query: Query): UserRepo {
    return new UserRepo(query)
  }
}
