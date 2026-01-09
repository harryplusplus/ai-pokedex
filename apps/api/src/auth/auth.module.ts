import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { DbModule } from '../db/db.module.js'
import { GoogleAuthModule } from '../google-auth/google-auth.module.js'
import { RefreshTokenModule } from '../refresh-token/refresh-token.module.js'
import { TrpcModule } from '../trpc/trpc.module.js'
import { UserModule } from '../user/user.module.js'
import { AuthController } from './auth.controller.js'
import { AuthService } from './auth.service.js'
import { JwtService } from './jwt.service.js'

@Module({
  imports: [
    JwtModule.register({}),
    TrpcModule,
    GoogleAuthModule,
    UserModule,
    DbModule,
    RefreshTokenModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtService],
  exports: [AuthService],
})
export class AuthModule {}
