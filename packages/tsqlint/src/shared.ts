export type WorkerInput = string

export interface Location {
  path: string
  line: number
  column: number
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
