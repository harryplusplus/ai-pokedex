import z from 'zod'

export const EnvVars = z.object({
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string().length(128),
  JWT_SECRET_OLDS: z
    .string()
    .optional()
    .default('')
    .transform((x) =>
      x
        .split(',')
        .map((x) => x.trim())
        .filter((x) => x.length > 0),
    )
    .pipe(z.string().length(128).array()),
})
export type EnvVars = z.infer<typeof EnvVars>
