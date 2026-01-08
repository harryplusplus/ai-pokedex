import { Injectable } from '@nestjs/common'
import { TrpcService } from '../trpc/trpc.service.js'
import { AuthSignIn, AuthSignInOutput } from './auth.schema.js'
import { AuthService } from './auth.service.js'

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

          const isProd = process.env.NODE_ENV === 'production'
          const prefix = isProd ? '__Secure-' : ''
          res.cookie(`${prefix}refreshToken`, refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
            expires: refreshTokenExpiresAt,
          })

          return {
            accessToken,
          }
        }),

      ping: trpcService.publicProcedure.query(() => {}),
    })
  }
}
