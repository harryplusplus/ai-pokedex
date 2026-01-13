import { Test, TestingModule } from '@nestjs/testing'
import { afterAll, beforeAll, expect, it } from 'vitest'

import { DbService } from '../db/db.service.js'
import { ApiKeyRepo } from './api-key.repo.js'
import { ApiKeyRepoFactory } from './api-key.repo-factory.js'
import { ApiKey } from './api-key.schema.js'

let app: TestingModule
let apiKeyRepo: ApiKeyRepo

beforeAll(async () => {
  app = await Test.createTestingModule({
    providers: [ApiKeyRepoFactory, DbService],
  }).compile()

  const dbService = app.get(DbService)
  const apiKeyRepoFactory = app.get(ApiKeyRepoFactory)
  apiKeyRepo = apiKeyRepoFactory.create(dbService.query)
})

afterAll(async () => {
  await app.close()
})

it('ApiKeyRepo.validate', async () => {
  expect(await apiKeyRepo.validate(ApiKey.parse('not-exist'))).toBe(false)
})
