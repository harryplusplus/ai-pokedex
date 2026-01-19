import { createContainer } from 'pocket-di'

import { pgPoolProvider } from './db/pg-pool.ts'
import { envVarsProvider } from './env-vars.ts'

export const container = createContainer({
  providers: [envVarsProvider, pgPoolProvider],
})
