import { Test, TestingModule } from '@nestjs/testing'
import { afterAll, beforeAll, expect, it } from 'vitest'
import { ConfigModule } from '../config/config.module.js'
import { DbModule } from '../db/db.module.js'
import { DbService } from '../db/db.service.js'
import { ApiKeyRepo } from './api-key.repo.js'
import { ApiKey } from './api-key.schema.js'
import { ApiKeyService } from './api-key.service.js'

let app: TestingModule
let dbService: DbService
let apiKeyService: ApiKeyService
let apiKeyRepo: ApiKeyRepo

beforeAll(async () => {
  app = await Test.createTestingModule({
    imports: [ConfigModule, DbModule],
    providers: [ApiKeyService],
  }).compile()

  dbService = app.get(DbService)
  apiKeyService = app.get(ApiKeyService)
  apiKeyRepo = apiKeyService.createRepo(dbService.sql)
})

afterAll(async () => {
  await app.close()
})

it('ApiKeyRepo.validate', async () => {
  expect(await apiKeyRepo.validate(ApiKey.parse('not-exist'))).toBe(false)
})
