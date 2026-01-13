import { Injectable } from '@nestjs/common'
import { CookieOptions, Request, Response } from 'express'
import { Scannable } from 'nest-component-scan'

@Scannable()
@Injectable()
export class RefreshTokenCookieHelper {
  readonly cookieName = `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}refreshToken`
  readonly cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  }

  getCookie(req: Request): string | null {
    const value = req.cookies[this.cookieName] as string | undefined
    return value ?? null
  }

  setCookie(
    res: Response,
    input: { refreshToken: string; refreshTokenExpiresAt: Date },
  ) {
    const { refreshToken, refreshTokenExpiresAt } = input

    res.cookie(this.cookieName, refreshToken, {
      ...this.cookieOptions,
      expires: refreshTokenExpiresAt,
    })
  }

  clearCookie(res: Response) {
    res.clearCookie(this.cookieName, this.cookieOptions)
  }
}
