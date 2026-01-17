import { type InferContext, inject } from 'pouch-di'

import { Db } from '../db/db.ts'

export class RefreshTokenRepo {
  static [inject] = {
    db: Db,
  }

  readonly #c: InferContext<typeof RefreshTokenRepo>

  constructor(c: InferContext<typeof RefreshTokenRepo>) {
    this.#c = c
  }

  async check() {
    await this.#c.db.client.query('select 1')
  }
}
