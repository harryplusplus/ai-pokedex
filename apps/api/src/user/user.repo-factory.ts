import { Injectable } from '@nestjs/common'
import { Scannable } from 'nest-component-scan'

import { Client } from '../db/db.types.js'
import { UserRepo } from './user.repo.js'

@Scannable()
@Injectable()
export class UserRepoFactory {
  create(client: Client): UserRepo {
    return new UserRepo(client)
  }
}
