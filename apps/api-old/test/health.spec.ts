import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { App } from 'supertest/types.js'
import { beforeEach, describe, it } from 'vitest'

import { HealthController } from '../src/health/health.controller.js'

describe('HealthController (e2e)', () => {
  let app: INestApplication<App>

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  it('/health (GET)', () => {
    return request(app.getHttpServer()).get('/health').expect(200).expect('ok')
  })
})
