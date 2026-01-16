import { Config, container, DbService } from '@repo/server'
import { betterAuth } from 'better-auth'

const dbService = await container.resolve(DbService)
const config = await container.resolve(Config)

// NOTE: Scan this auth object from cli.
export const auth = betterAuth({
  database: dbService.pool,
  socialProviders: {
    google: {
      clientId:
        '179009707988-aej3ieths6olvv4amed5asbc2meaubic.apps.googleusercontent.com',
      clientSecret: config.envVars.GOOGLE_CLIENT_SECRET,
    },
  },
})
