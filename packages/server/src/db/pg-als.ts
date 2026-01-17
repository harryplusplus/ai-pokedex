import { AsyncLocalStorage } from 'node:async_hooks'

import type pg from 'pg'
import { type InferDependencies, inject } from 'pouch-di'

import { pgPoolToken } from './pg-pool.ts'
import { type IsolationLevel, transaction } from './pg-utils.ts'

export type PgClient = Pick<pg.ClientBase, 'query'>

export const pgClientAls = new AsyncLocalStorage<PgClient>()

type Deps = InferDependencies<typeof PgAls>

export class PgAls {
  static [inject] = {
    pgPool: pgPoolToken,
  }

  readonly #c: Deps

  constructor(deps: Deps) {
    this.#c = deps
  }

  async withClient<R>(fn: () => Promise<R>): Promise<R> {
    const client = await this.#c.pgPool.connect()
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

    return await transaction(
      {
        pool: this.#c.pgPool,
        isolationLevel,
      },
      (client) => pgClientAls.run(client, callback),
    )
  }
}
