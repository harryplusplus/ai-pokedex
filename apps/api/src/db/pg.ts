import { AsyncLocalStorage } from 'node:async_hooks'

import pg, { types } from 'pg'

export function resetDateTypeParsers(): void {
  const oidsForParserReset = [
    /* date */ 1082, /* timestamp */ 1114, /* timestamptz */ 1184,
    /* date[] */ 1182, /* timestamp[] */ 1115, /* timestamptz[] */ 1185,
  ]

  oidsForParserReset.forEach((oid) => {
    types.setTypeParser(oid, (x) => x)
  })
}

export type PgClient = Pick<pg.ClientBase, 'query'>

export const pgClientStorage = new AsyncLocalStorage<PgClient>()
