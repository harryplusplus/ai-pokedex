import { Injectable } from '@nestjs/common'
import { Sql } from 'postgres'
import { Scannable } from '../component-scan/scannable.decorator.js'
import { UserRepo } from './user.repo.js'

@Scannable()
@Injectable()
export class UserRepoFactory {
  create(sql: Sql): UserRepo {
    return new UserRepo(sql)
  }
}
