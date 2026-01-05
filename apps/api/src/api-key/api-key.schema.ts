import z from 'zod'

export const ApiKey = z.string()
export type ApiKey = z.infer<typeof ApiKey>
