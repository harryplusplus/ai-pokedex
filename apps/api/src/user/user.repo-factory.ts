import { Injectable } from '@nestjs/common'
import { Sql } from 'postgres'
import { ProvidedIn } from '../provided-in/provided-in.decorator.js'
import { UserRepo } from './user.repo.js'

@ProvidedIn()
@Injectable()
export class UserRepoFactory {
  create(sql: Sql): UserRepo {
    return new UserRepo(sql)
  }
}
