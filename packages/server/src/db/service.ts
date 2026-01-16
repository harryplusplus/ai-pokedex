import { type Context, inject, onDestroy, type OnDestroyable } from 'esdi'
import pg from 'pg'

import { Config } from '../config/config.ts'
import { pgClientAls } from './pg-client-als.ts'
import {
  type IsolationLevel,
  resetDateTypeParsers,
  transaction,
} from './pg-utils.ts'

export class DbService implements OnDestroyable {
  static [inject] = {
    config: Config,
  }

  readonly pool: pg.Pool

  constructor(c: Context<typeof DbService>) {
    resetDateTypeParsers()

    this.pool = new pg.Pool({
      connectionString: c.config.envVars.DATABASE_URL,
    })
  }

  async [onDestroy](): Promise<void> {
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
