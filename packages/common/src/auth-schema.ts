import z from 'zod'

export const AuthSignIn = z.object({
  provider: z.enum(['google']),
  idToken: z.string().min(1),
})
export type AuthSignIn = z.infer<typeof AuthSignIn>

export const AccessTokenDto = z.object({
  accessToken: z.string().min(1),
})
export type AccessTokenDto = z.infer<typeof AccessTokenDto>
