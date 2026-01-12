import { Injectable, OnApplicationShutdown } from '@nestjs/common'
import { Scannable } from 'nest-component-scan'
import postgres from 'postgres'

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
