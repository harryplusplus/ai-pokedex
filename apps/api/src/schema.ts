import z from 'zod'

export const EmptyInput = z.object({}).default({})
export type EmptyInput = z.infer<typeof EmptyInput>
