import { Injectable } from '@nestjs/common'
import z from 'zod'
import { TrpcService } from '../trpc/trpc.service.js'
import { AuthSignIn, AuthSignInOutput } from './auth.schema.js'
import { AuthService } from './auth.service.js'

const REFRESH_TOKEN_COOKIE_INFO = {
  name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}refreshToken`,
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    // TODO: test strict, lax, none
    // sameSite: 'none',
  },
} as const

@Injectable()
export class AuthTrpcRouter {
  readonly router

  constructor(trpcService: TrpcService, authService: AuthService) {
    this.router = trpcService.trpc.router({
      signIn: trpcService.publicProcedure
        .input(AuthSignIn)
        .output(AuthSignInOutput)
        .mutation(async ({ ctx, input }) => {
          const { res } = ctx

          const { accessToken, refreshToken, refreshTokenExpiresAt } =
            await authService.signIn(input)

          res.cookie(REFRESH_TOKEN_COOKIE_INFO.name, refreshToken, {
            ...REFRESH_TOKEN_COOKIE_INFO.options,
            expires: refreshTokenExpiresAt,
          })

          return {
            accessToken,
          }
        }),
      signOut: trpcService.publicProcedure
        .input(z.void())
        .output(z.void())
        .mutation(async ({ ctx }) => {
          const { req, res } = ctx

          const [_, refreshToken] =
            req.headers.cookie
              ?.split(';')
              .map((x) => x.trim())
              .map((x) => x.split('='))
              .find(([name]) => name === REFRESH_TOKEN_COOKIE_INFO.name) ?? []

          if (refreshToken) {
            await authService.signOut(refreshToken)
          }

          res.clearCookie(
            REFRESH_TOKEN_COOKIE_INFO.name,
            REFRESH_TOKEN_COOKIE_INFO.options,
          )
        }),
    })
  }
}
