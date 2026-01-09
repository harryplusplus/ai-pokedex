import { Injectable } from '@nestjs/common'
import { TRPCError } from '@trpc/server'
import z from 'zod'
import { EmptyInput } from '../schema.js'
import { TrpcService } from '../trpc/trpc.service.js'
import {
  clearRefreshTokenCookie,
  parseRefreshToken,
  setRefreshTokenCookie,
} from './auth.cookie.js'
import {
  AuthRefreshOutput,
  AuthSignIn,
  AuthSignInOutput,
} from './auth.schema.js'
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

          const output = await authService.signIn(input)

          setRefreshTokenCookie(res, output)

          return {
            accessToken: output.accessToken,
          }
        }),

      signOut: trpcService.publicProcedure
        .input(EmptyInput)
        .output(z.void())
        .mutation(async ({ ctx }) => {
          const { req, res } = ctx

          try {
            const refreshToken = parseRefreshToken(req)
            if (refreshToken) {
              await authService.signOut(refreshToken)
            }
          } finally {
            clearRefreshTokenCookie(res)
          }
        }),

      refresh: trpcService.publicProcedure
        .input(EmptyInput)
        .output(AuthRefreshOutput)
        .mutation(async ({ ctx }) => {
          const { req, res } = ctx

          try {
            const refreshToken = parseRefreshToken(req)
            if (!refreshToken) {
              throw new TRPCError({
                code: 'UNAUTHORIZED',
                message: 'Invalid token.',
              })
            }

            const output = await authService.refresh(refreshToken)
            if (!output) {
              throw new TRPCError({
                code: 'UNAUTHORIZED',
                message: 'Invalid token.',
              })
            }

            setRefreshTokenCookie(res, output)

            return {
              accessToken: output.accessToken,
            }
          } catch (e) {
            clearRefreshTokenCookie(res)

            throw e
          }
        }),
    })
  }
}
