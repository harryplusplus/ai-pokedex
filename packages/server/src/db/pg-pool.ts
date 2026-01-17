import pg from 'pg'
import { define } from 'pouch-di'

import { envVarsToken } from '../env-vars.ts'
import { resetDateTypeParsers } from './pg-utils.ts'

export const pgPoolDef = define({
  token: 'pgPool',
  inject: {
    envVars: envVarsToken,
  },
  fn: (c) => {
    resetDateTypeParsers()

    return new pg.Pool({
      connectionString: c.envVars.DATABASE_URL,
    })
  },
  on: {
    destroy: (self) => self.end(),
  },
})

export const pgPoolToken = pgPoolDef.token
