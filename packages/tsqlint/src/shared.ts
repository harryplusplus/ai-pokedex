import debug from 'debug'

export interface WorkerInput {
  sourcePath: string
}

export interface Location {
  path: string

  /** 1-based line number. */
  line: number

  /** 0-based column number. */
  column: number
}

export function formatLocation(
  location: Location,
  options?: {
    readable?: boolean
  },
): string {
  const { path, line } = location
  const { readable = true } = options ?? {}

  const column = readable ? location.column + 1 : location.column

  return `${path}:${line}:${column}`
}

export interface QueryParsedItem {
  kind: 'query'
  location: Location
  query: string
}

export interface SkippedParsedItem {
  kind: 'skipped'
  location: Location
}

export type ParsedItem = QueryParsedItem | SkippedParsedItem

export type WorkerOutput = ParsedItem[]

export function createDebug(namespace: string): debug.Debugger {
  return debug(`TSQLint:${namespace}`)
}
