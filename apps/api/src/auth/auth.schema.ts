import z from 'zod'

export const AuthSignIn = z.object({
  idToken: z.string().min(1),
})
export type AuthSignIn = z.infer<typeof AuthSignIn>
