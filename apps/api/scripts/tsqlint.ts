import { Pool, type PoolClient } from 'pg'
import type { Connection, DataSource } from 'tsqlint'
import { formatLocation, run } from 'tsqlint'

class PgConnection implements Connection {
  #client: PoolClient

  constructor(client: PoolClient) {
    this.#client = client
  }

  async query(query: string): Promise<void> {
    await this.#client.query(query)
  }

  [Symbol.asyncDispose](): Promise<void> {
    return Promise.resolve(this.#client.release())
  }
}

class PgPool implements DataSource {
  #pool = new Pool({
    connectionString: 'postgres://postgres:postgres@localhost:5432/postgres',
  })

  async connect(): Promise<Connection> {
    const client = await this.#pool.connect()
    return new PgConnection(client)
  }

  async [Symbol.asyncDispose](): Promise<void> {
    await this.#pool.end()
  }
}

async function main() {
  const abortController = new AbortController()

  process.on('SIGINT', () => {
    abortController.abort()
  })

  const signal = abortController.signal

  await using pool = new PgPool()

  {
    await using _ = await pool.connect()
  }

  const stream = run({
    signal,
    dataSource: pool,
    paths: 'src',
    ignores: '**/*.d.ts',
  })

  for await (const lintItem of stream) {
    if (signal.aborted) {
      break
    }

    const { kind, location } = lintItem
    const locationString = formatLocation(location)

    if (kind === 'valid') {
      console.log(`[TSQLint] Valid query at [${locationString}]`)
    } else if (kind === 'invalid') {
      console.log(
        `[TSQLint] Invalid query with error ${lintItem.error} at [${locationString}]`,
      )
    } else if (kind === 'skipped') {
      console.log(`[TSQLint] Validation skipped query at [${locationString}]`)
    } else {
      console.log(`[TSQLint] Unknown kind query at [${locationString}]`)
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
