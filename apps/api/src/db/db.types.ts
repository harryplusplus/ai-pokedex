/* eslint-disable @typescript-eslint/no-explicit-any */

import { QueryConfig, QueryResult, QueryResultRow } from 'pg'

export interface Client {
  query<R extends QueryResultRow = any, I = any>(
    queryConfig: QueryConfig<I>,
  ): Promise<QueryResult<R>>
}
