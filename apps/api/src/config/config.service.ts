import { Injectable } from '@nestjs/common'
import { ConfigService as NestConfigService } from '@nestjs/config'
import { ProvidedIn } from '../provided-in/provided-in.decorator.js'
import { EnvVars } from './config.schema.js'

@ProvidedIn()
@Injectable()
export class ConfigService {
  constructor(
    private readonly nestConfigService: NestConfigService<EnvVars, true>,
  ) {}

  get databaseUrl(): string {
    return this.nestConfigService.getOrThrow('DATABASE_URL', { infer: true })
  }

  get jwtSecret(): string {
    return this.nestConfigService.getOrThrow('JWT_SECRET', { infer: true })
  }

  get jwtSecretOlds(): string[] {
    return this.nestConfigService.getOrThrow('JWT_SECRET_OLDS', { infer: true })
  }
}
