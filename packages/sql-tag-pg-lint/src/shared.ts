export type WorkerInput = string

export interface QueryInfo {
  query: string
  line: number
  column: number
}

export type WorkerOutput = QueryInfo[]
