import { Injectable } from '@nestjs/common'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { TrpcService } from '../trpc/trpc.service.js'
import { UserTrpcRouter } from '../user/user.trpc-router.js'

@Injectable()
export class AppTrpcRouter {
  readonly router

  constructor(trpcService: TrpcService, userTrpcRouter: UserTrpcRouter) {
    this.router = trpcService.trpc.router({
      user: userTrpcRouter.router,
    })
  }

  createMiddleware() {
    return createExpressMiddleware({
      router: this.router,
      createContext: (opts) => {
        const { req, res } = opts
        return {
          req,
          res,
        }
      },
    })
  }
}

export type AppRouter = AppTrpcRouter['router']
