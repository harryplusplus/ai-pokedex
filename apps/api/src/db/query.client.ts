import type {
  QueryConfig,
  QueryOptions,
  QueryResult,
  RawQueryClient,
  Row,
} from './db.types.ts'

export class QueryClient {
  readonly #raw: RawQueryClient

  constructor(raw: RawQueryClient) {
    this.#raw = raw
  }

  async query<T extends Row>(
    config: QueryConfig,
    options?: QueryOptions,
  ): Promise<QueryResult<T>> {
    const result = await this.#raw.query({
      ...config,
      ...options,
    })

    return {
      rows: result.rows as T[],
      rowCount: result.rowCount ?? 0,
    }
  }
}
