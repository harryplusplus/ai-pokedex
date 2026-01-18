import { Container } from 'pocket-di'

import { pgPoolProvider, pgPoolToken } from './db/pg-pool.ts'
import { envVarsProvider, envVarsToken } from './env-vars.ts'

export const container = new Container()

container
  .register(envVarsToken, envVarsProvider)
  .register(pgPoolToken, pgPoolProvider)
