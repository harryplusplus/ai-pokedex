import { Injectable, OnApplicationShutdown } from '@nestjs/common'
import postgres from 'postgres'
import { Scannable } from '../component-scan/scannable.decorator.js'
import { ConfigService } from '../config/config.service.js'

@Scannable()
@Injectable()
export class DbService implements OnApplicationShutdown {
  readonly sql

  constructor(configService: ConfigService) {
    this.sql = postgres(configService.databaseUrl, {
      max: 15,
      debug: process.env.NODE_ENV === 'development',
      transform: postgres.toCamel,
    })
  }

  async onApplicationShutdown(): Promise<void> {
    await this.sql.end()
  }
}
