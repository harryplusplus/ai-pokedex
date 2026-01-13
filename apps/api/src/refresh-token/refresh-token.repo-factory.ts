import { Injectable } from '@nestjs/common'
import { Scannable } from 'nest-component-scan'

import { Client } from '../db/db.types.js'
import { RefreshTokenRepo } from './refresh-token.repo.js'

@Scannable()
@Injectable()
export class RefreshTokenRepoFactory {
  create(client: Client): RefreshTokenRepo {
    return new RefreshTokenRepo(client)
  }
}
