import { Container } from 'pouch-di'

import { envVarsDef, envVarsToken } from './env-vars.ts'

export const container = new Container()

container.provide(envVarsToken, envVarsDef)
