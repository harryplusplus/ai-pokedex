import type { Parser, Plugin } from 'prettier'

import { PG } from './constants.js'

const sqlParser: Parser<string> = {
  parse: (text) => text,
  astFormat: PG,
  locStart: () => -1,
  locEnd: () => -1,
}

export const parsers: Plugin<string>['parsers'] = {
  sql: sqlParser,
}
