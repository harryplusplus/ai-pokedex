import { type Context, inject } from 'esdi'

import { Db } from '../db/db.ts'

export class RefreshTokenRepo {
  static [inject] = {
    db: Db,
  }

  readonly #c: Context<typeof RefreshTokenRepo>

  constructor(c: Context<typeof RefreshTokenRepo>) {
    this.#c = c
  }

  async check() {
    await this.#c.db.client.query('select 1')
  }
}
