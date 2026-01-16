import { inject, onClose, type OnCloseable } from 'esdi'
import pg from 'pg'

import { queryClientStorage, resetDateTypeParsers } from './pg.ts'

export type IsolationLevel = 'READ COMMITTED' | 'SERIALIZABLE'

export class DbPool implements OnCloseable {
  static [inject] = {}

  readonly pool: pg.Pool

  constructor() {
    resetDateTypeParsers()

    this.pool = new pg.Pool({
      connectionString: 'postgres://postgres:postgres@localhost:5432/postgres',
    })
  }

  async [onClose](): Promise<void> {
    await this.pool.end()
  }

  async withClient<R>(fn: () => Promise<R>): Promise<R> {
    const client = await this.pool.connect()
    try {
      return await queryClientStorage.run(client, fn)
    } finally {
      client.release()
    }
  }

  async withTransaction<R>(
    fn: () => Promise<R>,
    options?: {
      isolationLevel?: IsolationLevel
    },
  ): Promise<R> {
    const { isolationLevel } = options ?? {}

    const client = await this.pool.connect()
    try {
      await client.query(
        `BEGIN${isolationLevel ? ` ISOLATION LEVEL ${isolationLevel}` : ''}`,
      )

      const result = await queryClientStorage.run(client, fn)

      await client.query('COMMIT')

      return result
    } catch (e) {
      await client.query('ROLLBACK').catch((e) => {
        // TODO: logging
      })

      throw e
    } finally {
      client.release()
    }
  }
}
