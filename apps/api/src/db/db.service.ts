import { Injectable, OnApplicationShutdown } from '@nestjs/common'
import { Scannable } from 'nest-component-scan'
import { Pool, PoolClient } from 'pg'

import { ConfigService } from '../config/config.service.ts'
import {
  IsolationLevel,
  resetDateTypeParsers,
  transaction,
} from './db.utils.ts'
import { RepositoryClient } from './repository.client.ts'

@Scannable()
@Injectable()
export class DbService implements OnApplicationShutdown {
  #pool: Pool

  constructor(configService: ConfigService) {
    resetDateTypeParsers()

    this.#pool = new Pool({
      connectionString: configService.databaseUrl,
      max: 15,
    })
  }

  async onApplicationShutdown(): Promise<void> {
    await this.#pool.end()
  }

  get client(): RepositoryClient<Pool> {
    return new RepositoryClient(this.#pool)
  }

  async transaction<T>(
    onTransaction: (client: RepositoryClient<PoolClient>) => Promise<T>,
    options?: { isolationLevel?: IsolationLevel },
  ): Promise<T> {
    return await transaction(
      {
        pool: this.#pool,
        isolationLevel: options?.isolationLevel,
      },
      onTransaction,
    )
  }
}
