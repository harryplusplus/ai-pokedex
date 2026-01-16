import { toNextJsHandler } from 'better-auth/next-js'

import { auth } from '@/server/auth'
import { initServer } from '@/server/init'

await initServer()

export const { POST, GET } = toNextJsHandler(auth)
