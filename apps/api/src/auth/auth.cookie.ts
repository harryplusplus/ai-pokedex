import type { Request, Response } from 'express'

const REFRESH_TOKEN_COOKIE_INFO = {
  name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}refreshToken`,
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
  },
} as const

export function parseRefreshToken(req: Request): string | null {
  const value = req.cookies[REFRESH_TOKEN_COOKIE_INFO.name] as
    | string
    | undefined
  return value ?? null
}

export function setRefreshTokenCookie(
  res: Response,
  input: { refreshToken: string; refreshTokenExpiresAt: Date },
) {
  const { refreshToken, refreshTokenExpiresAt } = input

  res.cookie(REFRESH_TOKEN_COOKIE_INFO.name, refreshToken, {
    ...REFRESH_TOKEN_COOKIE_INFO.options,
    expires: refreshTokenExpiresAt,
  })
}

export function clearRefreshTokenCookie(res: Response) {
  res.clearCookie(
    REFRESH_TOKEN_COOKIE_INFO.name,
    REFRESH_TOKEN_COOKIE_INFO.options,
  )
}
