import { type Pool, types } from 'pg'

import { createSql, type Sql } from './pg-sql.js'

export function resetDateTypeParsers(): void {
  const oidsForParserReset = [
    /* date */ 1082, /* timestamp */ 1114, /* timestamptz */ 1184,
    /* date[] */ 1182, /* timestamp[] */ 1115, /* timestamptz[] */ 1185,
  ]

  oidsForParserReset.forEach((oid) => {
    types.setTypeParser(oid, (x) => x)
  })
}

export type IsolationLevel = 'READ COMMITTED' | 'SERIALIZABLE'

export async function transaction<T>(
  context: {
    pool: Pool
    isolationLevel?: IsolationLevel
  },
  onTransaction: (sql: Sql) => Promise<T>,
): Promise<T> {
  const { pool, isolationLevel } = context

  const client = await pool.connect()

  try {
    await client.query(
      `BEGIN${isolationLevel ? ` ISOLATION LEVEL ${isolationLevel}` : ''}`,
    )

    const result = await onTransaction(createSql(client))

    await client.query('COMMIT')

    return result
  } catch (e) {
    await client.query('ROLLBACK')

    throw e
  } finally {
    client.release()
  }
}
