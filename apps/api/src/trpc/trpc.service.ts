import { Injectable } from '@nestjs/common'
import { Scannable } from 'nest-component-scan'
import { initTRPC, TRPCErrorFormatter, TRPCErrorShape } from '@trpc/server'
// import { TRPC_ERROR_CODES_BY_KEY } from '@trpc/server/rpc'
import { Request, Response } from 'express'

// TODO
// import { getCodeKeyFromPrismaError } from '../error.js'

const _1_MINUTE_IN_MS = 60 * 1000

export interface Context {
  req: Request
  res: Response
}

@Scannable()
@Injectable()
export class TrpcService {
  readonly trpc
  readonly publicProcedure

  constructor() {
    this.trpc = initTRPC.context<Context>().create({
      errorFormatter: this.errorFormatter,
      sse: {
        ping: {
          enabled: true,
          intervalMs: _1_MINUTE_IN_MS,
        },
      },
    })
    this.publicProcedure = this.trpc.procedure
  }

  private errorFormatter: TRPCErrorFormatter<Context, TRPCErrorShape> = (
    opts,
  ) => {
    const { error, shape } = opts
    const errorShape: TRPCErrorShape = shape

    const { cause } = error

    if (cause instanceof Error) {
      errorShape.data = {
        ...errorShape.data,
        cause,
      }
      return errorShape
    }

    return errorShape
  }
}
