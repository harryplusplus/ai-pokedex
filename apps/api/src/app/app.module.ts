import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { GracefulShutdownModule } from '@tygra/nestjs-graceful-shutdown'
import { EnvVars } from '../config/config.schema.js'
import { ProvidedInModule } from '../provided-in/provided-in.module.js'
import { AppTrpcRouter } from './app.trpc-router.js'

@Module({
  imports: [
    ConfigModule,
    GracefulShutdownModule.forRoot(),
    JwtModule.register({}),
    ProvidedInModule.register(),
    ConfigModule.forRoot({
      validate: (config) => {
        return EnvVars.parse(config)
      },
    }),
  ],
})
export class AppModule implements NestModule {
  constructor(private readonly appTrpcRouter: AppTrpcRouter) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(this.appTrpcRouter.createMiddleware()).forRoutes('/trpc')
  }
}
