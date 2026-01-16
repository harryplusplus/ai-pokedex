import { inject } from 'esdi'

import { EnvVars } from './env-vars.ts'

export class Config {
  static [inject] = {}

  readonly envVars: EnvVars

  constructor() {
    console.log('process.env', process.env)
    this.envVars = EnvVars.parse(process.env)
  }
}
