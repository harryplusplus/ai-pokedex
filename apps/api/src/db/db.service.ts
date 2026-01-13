import { Injectable, OnApplicationShutdown } from '@nestjs/common'
import { Scannable } from 'nest-component-scan'
import { Pool } from 'pg'

import { ConfigService } from '../config/config.service.js'
import { createSql, Sql } from '../pg/pg-sql.js'
import { resetDateTypeParsers } from '../pg/pg-utils.js'

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
    options?: { isolationLevel?: 'READ COMMITTED' | 'SERIALIZABLE' },
  ): Promise<T> {
    const { isolationLevel } = options ?? {}

    const client = await this.#pool.connect()

    try {
      await client.query(
        `BEGIN${isolationLevel ? ` ISOLATION LEVEL ${isolationLevel}` : ''}`,
      )

      const result = await onTransaction(createSql(client))

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
