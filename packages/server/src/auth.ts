import { betterAuth } from 'better-auth'
import { toNextJsHandler } from 'better-auth/next-js'

import { container } from './container.ts'
import { DbService } from './db/service.ts'

const dbService = await container.resolve(DbService)

// NOTE: Scan this auth object from cli.
export const auth = betterAuth({
  database: dbService.pool,
  socialProviders: {
    google: {
      clientId:
        '179009707988-aej3ieths6olvv4amed5asbc2meaubic.apps.googleusercontent.com',
      clientSecret: '', // TODO: .env,
    },
  },
})

export const authHandler = toNextJsHandler(auth)
