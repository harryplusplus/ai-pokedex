import { AsyncLocalStorage } from 'node:async_hooks'

import type { Any } from 'esdi'
import pg, { type QueryConfig, types } from 'pg'

export type QueryClient = Pick<pg.ClientBase, 'query'>

export const queryClientStorage = new AsyncLocalStorage<QueryClient>()

export function resetDateTypeParsers(): void {
  const oidsForParserReset = [
    /* date */ 1082, /* timestamp */ 1114, /* timestamptz */ 1184,
    /* date[] */ 1182, /* timestamp[] */ 1115, /* timestamptz[] */ 1185,
  ]

  oidsForParserReset.forEach((oid) => {
    types.setTypeParser(oid, (x) => x)
  })
}

export function sql(
  strings: TemplateStringsArray,
  ...values: Any[]
): QueryConfig {
  const text = strings.reduce((prev, curr, i) => prev + '$' + i + curr)

  return {
    text,
    values,
  }
}
