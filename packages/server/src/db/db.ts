import { inject } from 'esdi'

import { type PgClient, pgClientAls } from './pg-client-storage.ts'

export class Db {
  static [inject] = {}

  get client(): PgClient {
    const client = pgClientAls.getStore()
    if (!client) {
      throw new Error('Invalid pg client context.')
    }

    return client
  }
}
