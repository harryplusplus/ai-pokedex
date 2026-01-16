import { inject, onClose, type OnCloseable } from 'esdi'
import pg from 'pg'

import { pgClientAls } from './pg-client-storage.ts'
import {
  type IsolationLevel,
  resetDateTypeParsers,
  transaction,
} from './pg-utils.ts'

export class DbService implements OnCloseable {
  static [inject] = {}

  readonly pool: pg.Pool

  constructor() {
    resetDateTypeParsers()

    // TODO: env
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
      return await pgClientAls.run(client, fn)
    } finally {
      client.release()
    }
  }

  async withTransaction<R>(
    isolationLevel: IsolationLevel,
    fn: () => Promise<R>,
  ): Promise<R>
  async withTransaction<R>(fn: () => Promise<R>): Promise<R>
  async withTransaction<R>(
    isolationLevelOrFn: IsolationLevel | (() => Promise<R>),
    fn?: () => Promise<R>,
  ): Promise<R> {
    const isolationLevel =
      typeof isolationLevelOrFn === 'string' ? isolationLevelOrFn : undefined

    const callback =
      typeof isolationLevelOrFn === 'function' ? isolationLevelOrFn : fn

    if (!callback) {
      throw new Error('Invalid fn state.')
    }

    return await transaction({ pool: this.pool, isolationLevel }, (client) =>
      pgClientAls.run(client, callback),
    )
  }
}
