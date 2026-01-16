import { container } from '@repo/server/container.ts'
import { validateTimeZone } from '@repo/server/utils.ts'

let isInitServerCalled = false

export function initServer() {
  if (isInitServerCalled) {
    return
  }

  isInitServerCalled = true

  validateTimeZone()

  process.on('SIGINT', () => void container.destroy())
  process.on('SIGTERM', () => void container.destroy())
}
