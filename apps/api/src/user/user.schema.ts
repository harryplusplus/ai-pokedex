import z from 'zod'

export const UserId = z.uuidv4().brand<'UserId'>()
export type UserId = z.infer<typeof UserId>
