import { Container } from 'pouch-di'

import { envVarsDef } from './env-vars.ts'

export const container = new Container()

container.provide(envVarsDef)
