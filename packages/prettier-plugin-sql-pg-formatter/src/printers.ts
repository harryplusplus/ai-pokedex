import type { Plugin, Printer } from 'prettier'
import psqlformat from 'psqlformat'

import { SQL_PG_FORMATTER } from './constants.js'

const sqlPgFormatterPrinter: Printer<string> = {
  print: (path, _options) => {
    const input = path.node

    const output = psqlformat.formatSql(input)

    return output
  },
}

export const printers: Plugin<string>['printers'] = {
  [SQL_PG_FORMATTER]: sqlPgFormatterPrinter,
}
