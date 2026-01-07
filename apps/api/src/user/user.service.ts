import { Injectable } from '@nestjs/common'
import { Sql } from 'postgres'
import { UserRepo } from './user.repo.js'

@Injectable()
export class UserService {
  newRepo(sql: Sql): UserRepo {
    return new UserRepo(sql)
  }
}
