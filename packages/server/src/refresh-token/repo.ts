import { type InferContext, inject } from 'pouch-di'

import { Db } from '../db/db.ts'

type Deps = InferContext<typeof RefreshTokenRepo>

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
