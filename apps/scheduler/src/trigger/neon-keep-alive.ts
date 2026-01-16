import { schedules } from '@trigger.dev/sdk'

export const neonKeepAlive = schedules.task({
  id: 'neon-keep-alive',
  run: async (payload) => {},
})
