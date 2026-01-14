export type Paths = string | string[]
export type Ignores = string | string[]

export interface Connection {
  query(query: string): Promise<void>

  [Symbol.asyncDispose]: () => Promise<void>
}

export interface DataSource {
  connect(): Promise<Connection>
}

export interface RunOptions {
  signal: AbortSignal
  dataSource: DataSource
  paths: Paths
  ignores?: Ignores
}

interface FilledRunOptions {
  signal: AbortSignal
  dataSource: DataSource
  paths: string[]
  ignores: string[]
}

export function fillRunOptions(options: RunOptions): FilledRunOptions {
  const { paths, ignores = [], ...restOptions } = options
  return {
    ...restOptions,
    paths: Array.isArray(paths) ? paths : [paths],
    ignores: Array.isArray(ignores) ? ignores : [ignores],
  }
}
