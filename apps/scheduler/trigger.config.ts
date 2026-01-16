import { defineConfig } from '@trigger.dev/sdk/v3'

const _1HourInSeconds = 60 * 60

export default defineConfig({
  project: 'proj_gutbbvsglhfrupinqywz',
  maxDuration: _1HourInSeconds,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ['./src/trigger'],
})
