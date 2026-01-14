import type { Parser, Plugin } from 'prettier'

import { SQL_TAG_PG } from './constants.ts'

const sqlParser: Parser<string> = {
  parse: (text) => text,
  astFormat: SQL_TAG_PG,
  locStart: () => -1,
  locEnd: () => -1,
}

export const parsers: Plugin<string>['parsers'] = {
  sql: sqlParser,
}
