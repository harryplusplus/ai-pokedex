import { type QueryResult, types } from 'pg'

import type { QueryConfig } from './pg-sql-tag.js'

export interface Result<Row extends Record<string, unknown>> {
  rows: Row[]
  rowCount: number
}

export interface Queryable<Name extends string> {
  <Row extends Record<string, unknown>>(
    queryConfig: QueryConfig,
    name?: Name,
  ): Promise<Result<Row>>
}

interface Client {
  query(queryConfig: QueryConfig & { name?: string }): Promise<QueryResult>
}

export function getQueryable<Name extends string>(
  client: Client,
): Queryable<Name> {
  const queryable: Queryable<Name> = async <
    Row extends Record<string, unknown>,
  >(
    queryConfig: QueryConfig,
    name?: Name,
  ): Promise<Result<Row>> => {
    const result = await client.query.bind(client)({
      ...queryConfig,
      name,
    })

    return {
      rows: result.rows as Row[],
      rowCount: result.rowCount ?? 0,
    }
  }

  return queryable
}

export function resetDateParsers(): void {
  const oidsForParserReset = [
    /* date */ 1082, /* timestamp */ 1114, /* timestamptz */ 1184,
    /* date[] */ 1182, /* timestamp[] */ 1115, /* timestamptz[] */ 1185,
  ]

  oidsForParserReset.forEach((oid) => {
    types.setTypeParser(oid, (x) => x)
  })
}
