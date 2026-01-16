import pg, { type QueryConfig, types } from 'pg'

export function resetDateTypeParsers(): void {
  const oidsForParserReset = [
    1082 /* date */, 1114 /* timestamp */, 1184 /* timestamptz */,
    1182 /* date[] */, 1115 /* timestamp[] */, 1185 /* timestamptz[] */,
  ]

  oidsForParserReset.forEach((oid) => {
    types.setTypeParser(oid, (x) => x)
  })
}

export type IsolationLevel = 'READ COMMITTED' | 'SERIALIZABLE'

export interface Logger {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(...data: any[]): void
}

export async function transaction<R>(
  context: {
    pool: pg.Pool
    isolationLevel?: IsolationLevel
    logger?: Logger
  },
  fn: (client: pg.PoolClient) => Promise<R>,
): Promise<R> {
  const { pool, isolationLevel, logger } = context

  const client = await pool.connect()
  try {
    await client.query(
      `BEGIN${isolationLevel ? ` ISOLATION LEVEL ${isolationLevel}` : ''}`,
    )

    const result = await fn(client)

    await client.query('COMMIT')

    return result
  } catch (e) {
    await client.query('ROLLBACK').catch((e) => {
      logger?.error(e)
    })

    throw e
  } finally {
    client.release()
  }
}

export function sql(
  strings: TemplateStringsArray,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...values: any[]
): QueryConfig {
  const text = strings.reduce((prev, curr, i) => prev + '$' + i + curr)

  return {
    text,
    values,
  }
}
