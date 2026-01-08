import { Test, TestingModule } from '@nestjs/testing'
import { afterAll, beforeAll, expect, it } from 'vitest'
import { ConfigModule } from '../config/config.module.js'
import { DbModule } from '../db/db.module.js'
import { DbService } from '../db/db.service.js'
import { UserRepoFactory } from './user.repo-factory.js'
import { UserRepo } from './user.repo.js'

let app: TestingModule
let userRepo: UserRepo

beforeAll(async () => {
  app = await Test.createTestingModule({
    imports: [ConfigModule, DbModule],
    providers: [UserRepoFactory],
  }).compile()

  const dbService = app.get(DbService)
  const userRepoFactory = app.get(UserRepoFactory)
  userRepo = userRepoFactory.newRepo(dbService.sql)
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
