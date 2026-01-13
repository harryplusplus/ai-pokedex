import type { QueryConfig, QueryResult } from 'pg'

//#region JSON types

type JsonPrimitive = string | number | boolean | null

type JsonObject = { [key: string]: JsonValue }

type JsonArray = JsonValue[]

type JsonValue = JsonPrimitive | JsonObject | JsonArray

//#endregion JSON

export type Value =
  | string
  | number
  | boolean
  | null
  | undefined
  | Date
  | Buffer
  | Value[]
  | JsonObject

export type Row = Record<string, unknown>

export interface Result<T extends Row = Row> {
  rows: T[]
  rowCount: number
}

export interface Sql {
  <T extends Row = Row>(
    strings: TemplateStringsArray,
    ...values: Value[]
  ): Promise<Result<T>>

  <T extends Row = Row>(
    name: string,
  ): (strings: TemplateStringsArray, ...values: Value[]) => Promise<Result<T>>
}

export interface Client {
  query(config: QueryConfig): Promise<QueryResult>
}

export function createSql(client: Client): Sql {
  const sqlOrFn = <T extends Row = Row>(
    stringsOrName: TemplateStringsArray | string,
    ...values: Value[]
  ):
    | Promise<Result<T>>
    | ((
        strings: TemplateStringsArray,
        ...values: Value[]
      ) => Promise<Result<T>>) => {
    if (Array.isArray(stringsOrName) && 'raw' in stringsOrName) {
      return query<T>(client, stringsOrName, values)
    }

    if (typeof stringsOrName === 'string') {
      const sql = (
        strings: TemplateStringsArray,
        ...values: Value[]
      ): Promise<Result<T>> => {
        return query<T>(client, strings, values, stringsOrName)
      }

      return sql
    }

    throw new Error('Invalid sql arguments.')
  }

  return sqlOrFn as Sql
}

//#region Internal

function buildText(strings: TemplateStringsArray): string {
  return strings.reduce((prev, curr, i) => prev + '$' + i + curr)
}

function mapResult<T extends Row>(result: QueryResult): Result<T> {
  return {
    rows: result.rows as T[],
    rowCount: result.rowCount ?? 0,
  }
}

async function query<T extends Row>(
  client: Client,
  strings: TemplateStringsArray,
  values: Value[],
  name?: string,
) {
  const text = buildText(strings)
  const result = await client.query({ text, values, name })
  return mapResult<T>(result)
}

//#endregion Internal
