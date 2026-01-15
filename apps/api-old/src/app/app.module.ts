import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { GracefulShutdownModule } from '@tygra/nestjs-graceful-shutdown'

import { AuthController } from '../auth/auth.controller.ts'
import { AuthService } from '../auth/auth.service.ts'
import { JwtService } from '../auth/jwt.service.ts'
import { EnvVars } from '../config/config.schema.ts'
import { ConfigService } from '../config/config.service.ts'
import { DbService } from '../db/db.service.ts'
import { GoogleAuthService } from '../google-auth/google-auth.service.ts'
import { HealthController } from '../health/health.controller.ts'
import { RefreshTokenCookieHelper } from '../refresh-token/refresh-token-cookie.helper.ts'
import { TrpcService } from '../trpc/trpc.service.ts'
import { AppTrpcRouter } from './app.trpc-router.ts'

@Module({
  imports: [
    GracefulShutdownModule.forRoot(),
    ConfigModule.forRoot({
      validate: (config) => {
        return EnvVars.parse(config)
      },
    }),
    JwtModule.register({}),
  ],
  controllers: [AuthController, HealthController],
  providers: [
    AppTrpcRouter,
    TrpcService,
    AuthService,
    GoogleAuthService,
    DbService,
    JwtService,
    ConfigService,
    RefreshTokenCookieHelper,
  ],
})
export class AppModule implements NestModule {
  constructor(private readonly appTrpcRouter: AppTrpcRouter) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(this.appTrpcRouter.createMiddleware()).forRoutes('/trpc')
  }
}
