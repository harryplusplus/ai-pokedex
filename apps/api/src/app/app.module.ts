import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { GracefulShutdownModule } from '@tygra/nestjs-graceful-shutdown'
import { ApiKeyModule } from '../api-key/api-key.module.js'
import { TrpcModule } from '../trpc/trpc.module.js'
import { UserModule } from '../user/user.module.js'
import { AppController } from './app.controller.js'
import { AppService } from './app.service.js'
import { AppTrpcRouter } from './app.trpc-router.js'

@Module({
  imports: [
    GracefulShutdownModule.forRoot(),
    TrpcModule,
    UserModule,
    ApiKeyModule,
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
