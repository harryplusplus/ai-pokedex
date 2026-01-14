export type Paths = string | string[]
export type Ignores = string | string[]

export interface Client {
  release(): void
}

export interface Pool {
  connect(): Promise<Client>
  query(query: string): Promise<void>
}

export interface RunOptions {
  signal: AbortSignal
  pool: Pool
  paths: Paths
  ignores?: Ignores
}

interface FilledRunOptions {
  signal: AbortSignal
  pool: Pool
  paths: string[]
  ignores: string[]
}

export function fillRunOptions(options: RunOptions): FilledRunOptions {
  return {
    signal: options.signal,
    pool: options.pool,
    paths: Array.isArray(options.paths) ? options.paths : [options.paths],
    ignores: Array.isArray(options.ignores)
      ? options.ignores
      : options.ignores
        ? [options.ignores]
        : [],
  }
}
