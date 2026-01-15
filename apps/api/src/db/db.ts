import { inject } from 'es-di'

import { type QueryClient, queryClientStorage } from './pg.ts'

export class Db {
  static [inject] = {}

  get client(): QueryClient {
    const client = queryClientStorage.getStore()
    if (!client) {
      throw new Error('Invalid query client context.')
    }

    return client
  }
}
