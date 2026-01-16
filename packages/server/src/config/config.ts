import { inject } from 'esdi'

import { EnvVars } from './env-vars.ts'

export class Config {
  static [inject] = {}

  readonly envVars: EnvVars

  constructor() {
    this.envVars = EnvVars.parse(process.env)
  }
}
