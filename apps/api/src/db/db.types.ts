import {
  type QueryConfig as PgQueryConfig,
  type QueryResult as PgQueryResult,
} from 'pg'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RawQueryConfig<T = any[]> = PgQueryConfig<T>
export type RawQueryResult = PgQueryResult

export interface RawQueryClient {
  query(config: RawQueryConfig): Promise<RawQueryResult>
}

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

export type QueryConfig = Pick<RawQueryConfig<Value[]>, 'text' | 'values'>

export type QueryOptions = Pick<RawQueryConfig, 'name' | 'types'>

export type Row = Record<string, unknown>

export interface QueryResult<T extends Row = Row> {
  rows: T[]
  rowCount: number
}

const Name = [
  'refresh_token_create',
  'refresh_token_revoke',
  'refresh_token_lock',
] as const
type Name = (typeof Name)[number]

export function prepare<T extends Name>(name: T): T {
  return name
}
