import { inject, type Injected } from 'es-di'

import { DbPool } from './db/pool.ts'
import { RefreshTokenRepo } from './refresh-token-repo.ts'

export class App {
  static [inject] = {
    dbPool: DbPool,
    refreshTokenRepo: RefreshTokenRepo,
  }

  #dbPool: DbPool
  #refreshTokenRepo: RefreshTokenRepo

  constructor({ dbPool, refreshTokenRepo }: Injected<typeof App>) {
    this.#dbPool = dbPool
    this.#refreshTokenRepo = refreshTokenRepo
  }

  async check() {
    await this.#dbPool.withClient(async () => {
      await this.#refreshTokenRepo.check()
    })
  }
}
