import z from 'zod'

export const ApiKey = z.string().brand<'ApiKey'>()
export type ApiKey = z.infer<typeof ApiKey>
