import { Module } from '@nestjs/common'
import { TrpcModule } from '../trpc/trpc.module.js'
import { UserService } from './user.service.js'

@Module({
  imports: [TrpcModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
