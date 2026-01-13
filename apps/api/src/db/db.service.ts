import { Injectable, OnApplicationShutdown } from '@nestjs/common'
import { Scannable } from 'nest-component-scan'
import { Pool } from 'pg'

import { ConfigService } from '../config/config.service.js'
import { getQueryable, resetDateParsers } from '../pg/pg-utils.js'
import { Query } from './db.types.js'

@Scannable()
@Injectable()
export class DbService implements OnApplicationShutdown {
  #pool: Pool

  constructor(configService: ConfigService) {
    resetDateParsers()

    this.#pool = new Pool({
      connectionString: configService.databaseUrl,
      max: 15,
    })
  }

  async onApplicationShutdown(): Promise<void> {
    await this.#pool.end()
  }

  get query(): Query {
    return getQueryable(this.#pool)
  }

  async transaction<T>(
    onTransaction: (query: Query) => Promise<T>,
    options?: { isolationLevel?: 'READ COMMITTED' | 'SERIALIZABLE' },
  ): Promise<T> {
    const { isolationLevel } = options ?? {}

    const client = await this.#pool.connect()

    try {
      await client.query(
        `BEGIN${isolationLevel ? ` ISOLATION LEVEL ${isolationLevel}` : ''}`,
      )

      const result = await onTransaction(getQueryable(client))

      await client.query('COMMIT')

      return result
    } catch (e) {
      await client.query('ROLLBACK')

      throw e
    } finally {
      client.release()
    }
  }
}
