import { container, validateTimeZone } from '@repo/server'

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
