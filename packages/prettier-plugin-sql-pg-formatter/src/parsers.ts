import type { Parser, Plugin } from 'prettier'

import { SQL_PG_FORMATTER } from './constants.js'

const sqlParser: Parser<string> = {
  parse: (text) => text,
  astFormat: SQL_PG_FORMATTER,
  locStart: () => -1,
  locEnd: () => -1,
}

export const parsers: Plugin<string>['parsers'] = {
  sql: sqlParser,
}
