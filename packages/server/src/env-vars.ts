import { defineFactory, token } from 'pocket-di'
import z from 'zod'

export const EnvVars = z.object({
  NODE_ENV: z.enum(['development', 'production']),
  TZ: z.union([
    z.literal('UTC'),
    // NOTE: Vercel platform enforcement value.
    z.literal(':UTC'),
  ]),
  DATABASE_URL: z.url(),
  BETTER_AUTH_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
})
export type EnvVars = z.infer<typeof EnvVars>

export const envVarsToken = token<EnvVars>('envVars')

export const envVarsDef = defineFactory({
  useFactory: () => {
    return EnvVars.parse(process.env)
  },
})
