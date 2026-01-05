import { Injectable } from '@nestjs/common'
import { TrpcService } from '../trpc/trpc.service.js'

@Injectable()
export class UserTrpcRouter {
  readonly router

  constructor(trpcService: TrpcService) {
    this.router = trpcService.trpc.router({})
  }
}
