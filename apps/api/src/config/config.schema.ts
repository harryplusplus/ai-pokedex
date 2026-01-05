import z from 'zod'

export const EnvVars = z.object({
  DATABASE_URL: z.url(),
})
export type EnvVars = z.infer<typeof EnvVars>
