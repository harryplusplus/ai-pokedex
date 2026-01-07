import { Injectable } from '@nestjs/common'
import z from 'zod'
import { TrpcService } from '../trpc/trpc.service.js'
import { AuthSignIn } from './auth.schema.js'
import { AuthService } from './auth.service.js'

@Injectable()
export class AuthTrpcRouter {
  readonly router

  constructor(trpcService: TrpcService, authService: AuthService) {
    this.router = trpcService.trpc.router({
      signIn: trpcService.publicProcedure
        .input(AuthSignIn)
        .output(z.void())
        .mutation(({ input }) => authService.signIn(input)),
    })
  }
}
