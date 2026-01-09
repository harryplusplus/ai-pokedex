import z from 'zod'

export const RefreshTokenId = z.number().int().brand<'RefreshTokenId'>()
export type RefreshTokenId = z.infer<typeof RefreshTokenId>
