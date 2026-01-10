import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { GracefulShutdownModule } from '@tygra/nestjs-graceful-shutdown'
import { ComponentScanModule } from '../component-scan/component-scan.module.js'
import { EnvVars } from '../config/config.schema.js'
import { AppTrpcRouter } from './app.trpc-router.js'

@Module({
  imports: [
    GracefulShutdownModule.forRoot(),
    ComponentScanModule.forRoot({
      imports: [
        ConfigModule.forRoot({
          validate: (config) => {
            return EnvVars.parse(config)
          },
        }),
        JwtModule.register({}),
      ],
      pattern: ['dist/**/*.js'],
    }),
  ],
})
export class AppModule implements NestModule {
  constructor(private readonly appTrpcRouter: AppTrpcRouter) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(this.appTrpcRouter.createMiddleware()).forRoutes('/trpc')
  }
}
