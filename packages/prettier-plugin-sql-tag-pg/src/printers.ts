import type { Plugin, Printer } from 'prettier'
import psqlformat from 'psqlformat'

import { SQL_TAG_PG } from './constants.js'
import { resolveOptions } from './options.js'

const sqlTagPgPrinter: Printer<string> = {
  print: (path, options) => {
    const input = path.node

    const { sqlTagPgSpaces } = resolveOptions(options)

    const output = psqlformat.formatSql(input, {
      spaces: sqlTagPgSpaces,
    })

    return output
  },
}

export const printers: Plugin<string>['printers'] = {
  [SQL_TAG_PG]: sqlTagPgPrinter,
}
