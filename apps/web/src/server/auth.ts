import { Config, container, DbService } from '@repo/server'
import { betterAuth } from 'better-auth'

const GOOGLE_CLIENT_ID =
  '179009707988-aej3ieths6olvv4amed5asbc2meaubic.apps.googleusercontent.com'

const dbService = await container.resolve(DbService)
const config = await container.resolve(Config)

// NOTE: Scan this auth object from cli.
export const auth = betterAuth({
  database: dbService.pool,
  socialProviders: {
    google: {
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: config.envVars.GOOGLE_CLIENT_SECRET,
    },
  },
})
