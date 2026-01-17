import pg from 'pg'
import { defineFactory, token } from 'pocket-di'

import { envVarsToken } from '../env-vars.ts'
import { resetDateTypeParsers } from './pg-utils.ts'

export const pgPoolToken = token<pg.Pool>('pgPool')

export const pgPoolDef = defineFactory({
  inject: {
    envVars: envVarsToken,
  },
  useFactory: (deps) => {
    resetDateTypeParsers()

    return new pg.Pool({
      connectionString: deps.envVars.DATABASE_URL,
    })
  },
  preDestroy: async (instance) => {
    await instance.end()
  },
})
