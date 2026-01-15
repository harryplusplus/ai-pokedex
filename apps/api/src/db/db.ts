import { inject } from 'es-di'

import { type PgClient, pgClientStorage } from './pg.ts'

export class Db {
  static [inject] = {}

  get client(): PgClient {
    const pgClient = pgClientStorage.getStore()
    if (!pgClient) {
      throw new Error('Invalid pg client context.')
    }

    return pgClient
  }
}
