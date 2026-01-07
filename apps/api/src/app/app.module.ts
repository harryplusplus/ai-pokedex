import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { GracefulShutdownModule } from '@tygra/nestjs-graceful-shutdown'
import { ApiKeyModule } from '../api-key/api-key.module.js'
import { AuthModule } from '../auth/auth.module.js'
import { ConfigModule } from '../config/config.module.js'
import { DbModule } from '../db/db.module.js'
import { GoogleAuthModule } from '../google-auth/google-auth.module.js'
import { RefreshTokenModule } from '../refresh-token/refresh-token.module.js'
import { TrpcModule } from '../trpc/trpc.module.js'
import { UserModule } from '../user/user.module.js'
import { AppTrpcRouter } from './app.trpc-router.js'

@Module({
  imports: [
    ConfigModule,
    GracefulShutdownModule.forRoot(),
    TrpcModule,
    UserModule,
    ApiKeyModule,
    DbModule,
    GoogleAuthModule,
    AuthModule,
    RefreshTokenModule,
  ],
  providers: [AppTrpcRouter],
})
export class AppModule implements NestModule {
  constructor(private readonly appTrpcRouter: AppTrpcRouter) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(this.appTrpcRouter.createMiddleware()).forRoutes('/trpc')
  }
}
