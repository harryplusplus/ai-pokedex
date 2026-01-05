import { Injectable } from '@nestjs/common'
import { ConfigService as NestConfigService } from '@nestjs/config'
import { EnvVars } from './config.schema.js'

@Injectable()
export class ConfigService {
  constructor(
    private readonly nestConfigService: NestConfigService<EnvVars, true>,
  ) {}

  get databaseUrl(): string {
    return this.nestConfigService.get('DATABASE_URL', { infer: true })
  }
}
