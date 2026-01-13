import { Injectable } from '@nestjs/common'
import { Scannable } from 'nest-component-scan'

import { Query } from '../db/db.types.js'
import { RefreshTokenRepo } from './refresh-token.repo.js'

@Scannable()
@Injectable()
export class RefreshTokenRepoFactory {
  create(query: Query): RefreshTokenRepo {
    return new RefreshTokenRepo(query)
  }
}
