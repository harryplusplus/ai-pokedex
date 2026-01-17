import { container } from '@repo/server/container.ts'
import { pgPoolToken } from '@repo/server/db/pg-pool.ts'
import { envVarsToken } from '@repo/server/env-vars.ts'
import { betterAuth } from 'better-auth'

const GOOGLE_CLIENT_ID =
  '179009707988-aej3ieths6olvv4amed5asbc2meaubic.apps.googleusercontent.com'

const pgPool = await container.resolve(pgPoolToken)
const envVars = await container.resolve(envVarsToken)

// NOTE: Scan this auth object from cli.
export const auth = betterAuth({
  database: pgPool,
  socialProviders: {
    google: {
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
    },
  },
})
