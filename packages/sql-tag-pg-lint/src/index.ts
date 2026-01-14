import { Pool } from 'pg'

import { run } from './run/run.ts'

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
    paths:
      '/Users/harry/repo/ai-pokedex/apps/api/src/refresh-token/refresh-token.repo.ts',
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
