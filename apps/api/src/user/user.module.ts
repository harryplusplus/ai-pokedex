import { Module } from '@nestjs/common'
import { TrpcModule } from '../trpc/trpc.module.js'
import { UserTrpcRouter } from './user.trpc-router.js'

@Module({
  imports: [TrpcModule],
  providers: [UserTrpcRouter],
  exports: [UserTrpcRouter],
})
export class UserModule {}
