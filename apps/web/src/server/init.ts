import { Config } from '@repo/server/config/config.ts'
import { container } from '@repo/server/container.ts'
import { validateTimeZone } from '@repo/server/utils.ts'

let isInitServerCalled = false

export async function initServer() {
  if (isInitServerCalled) {
    return
  }

  isInitServerCalled = true

  validateTimeZone()

  process.on('SIGINT', () => void container.destroy())
  process.on('SIGTERM', () => void container.destroy())

  await container.resolve(Config)
}
