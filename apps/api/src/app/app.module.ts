import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { GracefulShutdownModule } from '@tygra/nestjs-graceful-shutdown'

import { EnvVars } from '../config/config.schema.js'
import {
  SCANNED_CONTROLLERS,
  SCANNED_INJECTABLES,
} from '../generated/nest-component-scan.js'
import { AppTrpcRouter } from './app.trpc-router.js'

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
  controllers: [...SCANNED_CONTROLLERS],
  providers: [...SCANNED_INJECTABLES],
})
export class AppModule implements NestModule {
  constructor(private readonly appTrpcRouter: AppTrpcRouter) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(this.appTrpcRouter.createMiddleware()).forRoutes('/trpc')
  }
}
