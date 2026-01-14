import type { Plugin } from 'prettier'

import type { SqlTagPgOptions } from './options.ts'
import { options } from './options.ts'
import { parsers } from './parsers.ts'
import { printers } from './printers.ts'

// Named exports for CJS compatibility.
export { options, parsers, printers, type SqlTagPgOptions }

// Default export for ESM compatibility.
const plugin: Plugin<string> = {
  options,
  parsers,
  printers,
}

export default plugin
