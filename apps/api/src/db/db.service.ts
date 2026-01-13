import { Injectable, OnApplicationShutdown } from '@nestjs/common'
import { Scannable } from 'nest-component-scan'
import { Pool, types } from 'pg'

import { ConfigService } from '../config/config.service.js'
import { Client } from './db.types.js'

@Scannable()
@Injectable()
export class DbService implements OnApplicationShutdown {
  #pool: Pool

  constructor(configService: ConfigService) {
    const oidsForParserReset = [
      /* date */ 1082, /* timestamp */ 1114, /* timestamptz */ 1184,
      /* date[] */ 1182, /* timestamp[] */ 1115, /* timestamptz[] */ 1185,
    ]

    oidsForParserReset.forEach((oid) => {
      types.setTypeParser(oid, (x) => x)
    })

    this.#pool = new Pool({
      connectionString: configService.databaseUrl,
      max: 15,
    })
  }

  async onApplicationShutdown(): Promise<void> {
    await this.#pool.end()
  }

  get client(): Client {
    return this.#pool
  }

  async transaction<T>(
    onTransaction: (client: Client) => Promise<T>,
    options?: { isolationLevel?: 'READ COMMITTED' | 'SERIALIZABLE' },
  ): Promise<T> {
    const { isolationLevel } = options ?? {}

    const client = await this.#pool.connect()

    try {
      await client.query(
        `BEGIN${isolationLevel ? ` ISOLATION LEVEL ${isolationLevel}` : ''}`,
      )

      const result = await onTransaction(client)

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
