export type WorkerInput = string

export interface QueryInfo {
  query: string
  span: {
    start: number
    end: number
  }
}

export type WorkerOutput = QueryInfo[]
