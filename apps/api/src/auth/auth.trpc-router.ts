import { Injectable } from '@nestjs/common'
import z from 'zod'
import { ApiKeyTrpcProcedure } from '../api-key/api-key.trpc-procedure.js'
import { TrpcService } from '../trpc/trpc.service.js'
import { AuthSignIn } from './auth.schema.js'
import { AuthService } from './auth.service.js'

@Injectable()
export class AuthTrpcRouter {
  readonly router

  constructor(
    trpcService: TrpcService,
    apiKeyTrpcProcedure: ApiKeyTrpcProcedure,
    authService: AuthService,
  ) {
    this.router = trpcService.trpc.router({
      signIn: apiKeyTrpcProcedure.procedure
        .input(AuthSignIn)
        .output(z.void())
        .mutation(({ input }) => authService.signIn(input)),
    })
  }
}
