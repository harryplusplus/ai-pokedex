import fg from 'fast-glob'
import { createJiti } from 'jiti'
import type { Parser, Plugin, Printer } from 'prettier'

import { fillOptions, type SqlAdapterConfig } from './options.ts'

const jiti = createJiti(import.meta.url)

const SQL_ADAPTER = 'sql-adapter'

const sqlParser: Parser<string> = {
  parse: (text) => text,
  astFormat: SQL_ADAPTER,
  locStart: () => -1,
  locEnd: () => -1,
}

export const parsers: Plugin<string>['parsers'] = {
  sql: sqlParser,
}

const sqlAdapterPrinter: Printer<string> = {
  preprocess: async (text, options) => {
    const { sqlAdapterConfig } = fillOptions(options)

    const stream = fg.stream(sqlAdapterConfig, { absolute: true })

    let configPath = ''
    for await (const path of stream) {
      configPath = path.toString()
      break
    }

    if (!configPath) {
      throw new Error()
    }

    const config: SqlAdapterConfig = await jiti.import(configPath, {
      default: true,
    })

    const output = config.format(text)

    return output
  },
  print: (path) => path.node,
}

export const printers: Plugin<string>['printers'] = {
  [SQL_ADAPTER]: sqlAdapterPrinter,
}
