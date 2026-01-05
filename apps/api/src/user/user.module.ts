import { Module } from '@nestjs/common'
import { ApiKeyModule } from '../api-key/api-key.module.js'
import { AuthModule } from '../auth/auth.module.js'
import { GoogleAuthModule } from '../google-auth/google-auth.module.js'
import { TrpcModule } from '../trpc/trpc.module.js'
import { UserService } from './user.service.js'
import { UserTrpcRouter } from './user.trpc-router.js'

@Module({
  imports: [TrpcModule, ApiKeyModule, GoogleAuthModule, AuthModule],
  providers: [UserTrpcRouter, UserService],
  exports: [UserTrpcRouter],
})
export class UserModule {}
