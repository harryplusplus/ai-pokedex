import { type PgClient, pgClientAls } from './pg-client-als.ts'

export class Db {
  get client(): PgClient {
    const client = pgClientAls.getStore()
    if (!client) {
      throw new Error('Invalid pg client context.')
    }

    return client
  }
}
