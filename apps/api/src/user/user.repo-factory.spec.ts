import { Test, TestingModule } from '@nestjs/testing'
import { afterAll, beforeAll, expect, it } from 'vitest'

import { DbService } from '../db/db.service.js'
import { UserRepo } from './user.repo.js'
import { UserRepoFactory } from './user.repo-factory.js'

let app: TestingModule
let userRepo: UserRepo

beforeAll(async () => {
  app = await Test.createTestingModule({
    providers: [UserRepoFactory, DbService],
  }).compile()

  const dbService = app.get(DbService)
  const userRepoFactory = app.get(UserRepoFactory)
  userRepo = userRepoFactory.create(dbService.client)
})

afterAll(async () => {
  await app.close()
})

it('UserRepo.createOrGetId', async () => {
  await expect(
    userRepo.createOrGetId({
      provider: 'google',
      providerUserId: 'abc',
    }),
  ).resolves.toBeDefined()
})
