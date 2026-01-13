import type { Plugin } from 'prettier'

import { options, type PgOptions } from './options.js'
import { parsers } from './parsers.js'
import { printers } from './printers.js'

// Named exports for CJS compatibility.
export { options, parsers, type PgOptions, printers }

// Default export for ESM compatibility.
export default {
  options,
  parsers,
  printers,
} satisfies Plugin<string>
