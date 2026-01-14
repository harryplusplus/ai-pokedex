import { Pool } from 'pg'
import { run } from 'sql-tag-pg-lint'

async function main() {
  const abortController = new AbortController()

  process.on('SIGINT', () => {
    abortController.abort()
  })

  const signal = abortController.signal

  const pool = new Pool({
    connectionString: 'postgres://postgres:postgres@localhost:5432/postgres',
  })

  const stream = run({
    signal,
    pool,
    paths: 'src',
  })

  try {
    for await (const lintInfo of stream) {
      if (signal.aborted) {
        break
      }

      console.log(
        `${lintInfo.error ? 'X' : 'O'} ${lintInfo.path}:${lintInfo.line}:${lintInfo.column}${lintInfo.error ? ` ${lintInfo.error}` : ''}`,
      )
    }
  } finally {
    await pool.end()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
