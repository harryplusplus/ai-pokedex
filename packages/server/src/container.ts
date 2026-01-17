import { Container } from 'pouch-di'

import { pgPoolDef } from './db/pg-pool.ts'
import { envVarsDef } from './env-vars.ts'

export const container = new Container()

container.provide(envVarsDef).provide(pgPoolDef)
