import { type InferDependencies, inject } from 'pouch-di'

import { Db } from '../db/db.ts'

type Deps = InferDependencies<typeof RefreshTokenRepo>

export class RefreshTokenRepo {
  static [inject] = {
    db: Db,
  }

  readonly #c: Deps

  constructor(deps: Deps) {
    this.#c = deps
  }

  async check() {
    await this.#c.db.client.query('select 1')
  }
}
