import { Pool } from 'pg'

import { run } from './run/run.ts'

async function main() {
  const abortController = new AbortController()
  process.on('SIGINT', () => {
    abortController.abort()
  })

  const pool = new Pool({
    connectionString: 'postgres://postgres:postgres@localhost:5432/postgres',
  })

  const stream = run({
    signal: abortController.signal,
    pool,
    paths:
      '/Users/harry/repo/ai-pokedex/apps/api/src/refresh-token/refresh-token.repo.ts',
  })

  try {
    for await (const lintInfo of stream) {
      console.log(lintInfo)
    }
  } finally {
    await pool.end()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
