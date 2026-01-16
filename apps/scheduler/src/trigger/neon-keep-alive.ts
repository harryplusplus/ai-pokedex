import { schedules } from '@trigger.dev/sdk'
import pg from 'pg'

export const neonKeepAlive = schedules.task({
  id: 'neon-keep-alive',
  cron: '0 0 */14 * *',
  run: async () => {
    const { DATABASE_URL } = process.env
    if (!DATABASE_URL) {
      throw new Error('Invalid DATABASE_URL.')
    }

    const pool = new pg.Pool({
      connectionString: DATABASE_URL,
      max: 1,
    })

    process.on('SIGINT', () => void pool.end())
    process.on('SIGTERM', () => void pool.end())

    try {
      await pool.query('select 1')
    } finally {
      await pool.end()
    }

    return 'ok'
  },
})
