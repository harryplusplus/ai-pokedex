import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface.js'
import { NestFactory } from '@nestjs/core'
import { setupGracefulShutdown } from '@tygra/nestjs-graceful-shutdown'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'

import { AppModule } from './app/app.module.js'
import { initOpenApi } from './open-api.js'
import { checkNodeEnv, checkTimeZone } from './utils.js'

async function bootstrap() {
  checkTimeZone()
  checkNodeEnv()

  const app = await NestFactory.create(AppModule)
  setupGracefulShutdown({ app })

  app.use(helmet())
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? 'https://ai-pokedex-api.vercel.app'
        : true,
    methods: ['GET', 'POST'],
    credentials: true,
  } satisfies CorsOptions)
  app.use(cookieParser())

  initOpenApi(app)

  await app.listen(process.env.PORT ?? 3100)
}

bootstrap().catch((e) => {
  console.error(e)
  process.exit(1)
})
