import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ApiKeyModule } from '../api-key/api-key.module.js'
import { TrpcModule } from '../trpc/trpc.module.js'
import { AuthService } from './auth.service.js'
import { AuthTrpcRouter } from './auth.trpc-router.js'

@Module({
  imports: [JwtModule.register({}), TrpcModule, ApiKeyModule],
  providers: [AuthService, AuthTrpcRouter],
  exports: [AuthService, AuthTrpcRouter],
})
export class AuthModule {}
