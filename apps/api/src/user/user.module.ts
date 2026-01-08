import { Module } from '@nestjs/common'
import { TrpcModule } from '../trpc/trpc.module.js'
import { UserRepoFactory } from './user.repo-factory.js'

@Module({
  imports: [TrpcModule],
  providers: [UserRepoFactory],
  exports: [UserRepoFactory],
})
export class UserModule {}
