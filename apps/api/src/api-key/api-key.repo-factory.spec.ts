import { Test, TestingModule } from '@nestjs/testing'
import { afterAll, beforeAll, expect, it } from 'vitest'
import { ConfigModule } from '../config/config.module.js'
import { DbModule } from '../db/db.module.js'
import { DbService } from '../db/db.service.js'
import { ApiKeyRepoFactory } from './api-key.repo-factory.js'
import { ApiKeyRepo } from './api-key.repo.js'
import { ApiKey } from './api-key.schema.js'

let app: TestingModule
let apiKeyRepo: ApiKeyRepo

beforeAll(async () => {
  app = await Test.createTestingModule({
    imports: [ConfigModule, DbModule],
    providers: [ApiKeyRepoFactory],
  }).compile()

  const dbService = app.get(DbService)
  const apiKeyRepoFactory = app.get(ApiKeyRepoFactory)
  apiKeyRepo = apiKeyRepoFactory.newRepo(dbService.sql)
})

afterAll(async () => {
  await app.close()
})

it('ApiKeyRepo.validate', async () => {
  expect(await apiKeyRepo.validate(ApiKey.parse('not-exist'))).toBe(false)
})
