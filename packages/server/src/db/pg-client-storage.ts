import { AsyncLocalStorage } from 'node:async_hooks'

import type pg from 'pg'

export type PgClient = Pick<pg.ClientBase, 'query'>

export const pgClientStorage = new AsyncLocalStorage<PgClient>()
