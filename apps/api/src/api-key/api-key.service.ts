import { Injectable } from '@nestjs/common'
import { ApiKey } from './api-key.schema.js'

@Injectable()
export class ApiKeyService {
  async validate(input: { apiKey: ApiKey }): Promise<boolean> {
    const { apiKey } = input
    throw new Error()
  }
}
