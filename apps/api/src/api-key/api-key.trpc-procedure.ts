import { Injectable } from '@nestjs/common'
import { TRPCError } from '@trpc/server'
import { Scannable } from 'nest-component-scan'

import { TrpcService } from '../trpc/trpc.service.js'
import { ApiKey } from './api-key.schema.js'
import { ApiKeyService } from './api-key.service.js'

@Scannable()
@Injectable()
export class ApiKeyTrpcProcedure {
  readonly procedure

  constructor(trpcService: TrpcService, apiKeyService: ApiKeyService) {
    this.procedure = trpcService.publicProcedure.use(async ({ ctx, next }) => {
      const { req } = ctx

      const parseHeader = () => {
        const header = req.headers['x-api-key']
        const result = ApiKey.safeParse(header)
        if (!result.success) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid X-Api-Key.',
          })
        }

        return result.data
      }

      const apiKey = parseHeader()

      if (!(await apiKeyService.validate(apiKey))) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid API key.',
        })
      }

      return next({ ctx })
    })
  }
}
