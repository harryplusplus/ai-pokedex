import { Container } from 'pocket-di'

import { pgPoolDef, pgPoolToken } from './db/pg-pool.ts'
import { envVarsDef, envVarsToken } from './env-vars.ts'

export const container = new Container()

container.register(envVarsToken, envVarsDef).register(pgPoolToken, pgPoolDef)
