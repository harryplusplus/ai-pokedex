import createDebug from 'debug'
import fg from 'fast-glob'
import { createJiti } from 'jiti'
import type { Parser, Plugin, Printer } from 'prettier'

import { fillOptions, type SqlAdapterConfig } from './options.ts'

const jiti = createJiti(import.meta.url)

const debug = createDebug('sql-adapter')

const AST_FORMAT = 'sql-adapter'

const parser: Parser<string> = {
  parse: (text) => text,
  astFormat: AST_FORMAT,
  locStart: () => -1,
  locEnd: () => -1,
}

export const parsers: Plugin<string>['parsers'] = {
  sql: parser,
}

const printer: Printer<string> = {
  preprocess: async (text, options) => {
    const { sqlAdapterConfig } = fillOptions(options)

    const stream = fg.stream(sqlAdapterConfig, { absolute: true })

    let configPath = ''
    for await (const path of stream) {
      configPath = path.toString()
      break
    }

    if (!configPath) {
      throw new Error(
        `SQL adapter config not found. sqlAdapterConfig: ${sqlAdapterConfig}`,
      )
    }

    debug(`configPath: ${configPath}`)

    const config: SqlAdapterConfig = await jiti.import(configPath, {
      default: true,
    })

    const formatted = await config.format(text)

    return formatted
  },
  print: (path) => path.node,
}

export const printers: Plugin<string>['printers'] = {
  [AST_FORMAT]: printer,
}
