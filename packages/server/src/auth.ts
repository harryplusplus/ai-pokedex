import { betterAuth } from 'better-auth'
import { toNextJsHandler } from 'better-auth/next-js'

import { container } from './container.ts'
import { DbPool } from './db/pool.ts'

const dbPool = await container.resolve(DbPool)

// NOTE: Scan this auth object from cli.
export const auth = betterAuth({
  database: dbPool.pool,
  socialProviders: {
    google: {
      clientId:
        '179009707988-aej3ieths6olvv4amed5asbc2meaubic.apps.googleusercontent.com',
      clientSecret: '', // TODO: .env,
    },
  },
})

export const authHandler = toNextJsHandler(auth)
