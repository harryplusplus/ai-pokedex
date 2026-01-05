import { Injectable } from '@nestjs/common'
import z from 'zod'
import { ApiKeyTrpcProcedure } from '../api-key/api-key.trpc-procedure.js'
import { TrpcService } from '../trpc/trpc.service.js'
import { UserSignIn } from './user.schema.js'
import { UserService } from './user.service.js'

@Injectable()
export class UserTrpcRouter {
  readonly router

  constructor(
    trpcService: TrpcService,
    apiKeyTrpcProcedure: ApiKeyTrpcProcedure,
    userService: UserService,
  ) {
    this.router = trpcService.trpc.router({
      signIn: apiKeyTrpcProcedure.procedure
        .input(UserSignIn)
        .output(z.void())
        .mutation(({ input }) => userService.signIn(input)),
    })
  }
}
