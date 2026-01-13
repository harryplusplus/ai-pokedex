import type { Plugin, Printer } from 'prettier'
import psqlformat from 'psqlformat'

import { PG } from './constants.js'
import { resolveOptions } from './options.js'

const pgPrinter: Printer<string> = {
  print: (path, options) => {
    const input = path.node

    const { pgSpaces } = resolveOptions(options)

    const output = psqlformat.formatSql(input, {
      spaces: pgSpaces,
    })

    return output
  },
}

export const printers: Plugin<string>['printers'] = {
  [PG]: pgPrinter,
}
