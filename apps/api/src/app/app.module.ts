import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { GracefulShutdownModule } from '@tygra/nestjs-graceful-shutdown'
import { ApiKeyModule } from '../api-key/api-key.module.js'
import { ConfigModule } from '../config/config.module.js'
import { DbModule } from '../db/db.module.js'
import { TrpcModule } from '../trpc/trpc.module.js'
import { UserModule } from '../user/user.module.js'
import { AppController } from './app.controller.js'
import { AppService } from './app.service.js'
import { AppTrpcRouter } from './app.trpc-router.js'

@Module({
  imports: [
    ConfigModule,
    GracefulShutdownModule.forRoot(),
    TrpcModule,
    UserModule,
    ApiKeyModule,
    DbModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppTrpcRouter],
})
export class AppModule implements NestModule {
  constructor(private readonly appTrpcRouter: AppTrpcRouter) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(this.appTrpcRouter.createMiddleware()).forRoutes('/trpc')
  }
}
