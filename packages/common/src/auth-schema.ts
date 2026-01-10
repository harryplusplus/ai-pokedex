import z from 'zod'

export const AuthSignIn = z.object({
  provider: z.enum(['google']),
  idToken: z.string().min(1),
})
export type AuthSignIn = z.infer<typeof AuthSignIn>

export const AuthSignInOutput = z.object({
  accessToken: z.string().min(1),
})
export type AuthSignInOutput = z.infer<typeof AuthSignInOutput>

export const AuthRefreshOutput = z.object({
  accessToken: z.string().min(1),
})
export type AuthRefreshOutput = z.infer<typeof AuthRefreshOutput>
