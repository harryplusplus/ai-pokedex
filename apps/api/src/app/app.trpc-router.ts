import { Injectable, Logger } from '@nestjs/common'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { TrpcService } from '../trpc/trpc.service.js'
import { toPrintable } from '../utils.js'

@Injectable()
export class AppTrpcRouter {
  readonly #logger = new Logger(AppTrpcRouter.name)
  readonly router

  constructor(trpcService: TrpcService) {
    this.router = trpcService.trpc.router({})
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
      onError: ({ path, error }) => {
        this.#logger.error(
          `Failed to processing tRPC. path: ${path}, error: ${toPrintable(error)}`,
          error.stack,
        )
      },
    })
  }
}

export type AppRouter = AppTrpcRouter['router']
