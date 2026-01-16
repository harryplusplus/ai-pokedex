import { inject } from 'esdi'

import { type PgClient, pgClientStorage } from './pg-client-storage.ts'

export class Db {
  static [inject] = {}

  get client(): PgClient {
    const client = pgClientStorage.getStore()
    if (!client) {
      throw new Error('Invalid pg client context.')
    }

    return client
  }
}
