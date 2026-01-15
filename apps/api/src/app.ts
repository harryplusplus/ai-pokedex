import { type Context, inject } from 'es-di'

import { DbPool } from './db/pool.ts'
import { RefreshTokenRepo } from './refresh-token/repo.ts'

export class App {
  static [inject] = {
    dbPool: DbPool,
    refreshTokenRepo: RefreshTokenRepo,
  }

  readonly #c: Context<typeof App>

  constructor(c: Context<typeof App>) {
    this.#c = c
  }

  async check() {
    await this.#c.dbPool.withClient(async () => {
      await this.#c.refreshTokenRepo.check()
    })
  }
}
