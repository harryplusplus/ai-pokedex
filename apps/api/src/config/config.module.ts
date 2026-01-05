import { Global, Module } from '@nestjs/common'
import { ConfigModule as NestConfigModule } from '@nestjs/config'
import { EnvVars } from './config.schema.js'
import { ConfigService } from './config.service.js'

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      validate: (config) => {
        return EnvVars.parse(config)
      },
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
