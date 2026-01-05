import z from 'zod'

export const UserSignIn = z.object({
  idToken: z.string().min(1),
})
export type UserSignIn = z.infer<typeof UserSignIn>
