import { inject, type Injected } from 'es-di'

import { Db } from '../db/db.ts'

export class RefreshTokenRepo {
  static [inject] = {
    db: Db,
  }

  #db: Db

  constructor({ db }: Injected<typeof RefreshTokenRepo>) {
    this.#db = db
  }

  async check() {
    await this.#db.client.query('select 1')
  }
}
