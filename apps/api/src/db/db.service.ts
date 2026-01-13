import { Injectable, OnApplicationShutdown } from '@nestjs/common'
import { Scannable } from 'nest-component-scan'
import { Pool } from 'pg'

import { ConfigService } from '../config/config.service.js'
import { createSql, Sql } from '../pg/pg-sql.js'
import {
  IsolationLevel,
  resetDateTypeParsers,
  transaction,
} from '../pg/pg-utils.js'

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

  get sql(): Sql {
    return createSql(this.#pool)
  }

  async transaction<T>(
    onTransaction: (sql: Sql) => Promise<T>,
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
