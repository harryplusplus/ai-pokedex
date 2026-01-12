import type { Plugin } from 'prettier'

import { options } from './options.js'
import { parsers } from './parsers.js'
import { printers } from './printers.js'

// Named exports for CJS compatibility.
export { options, parsers, printers }

// Default export for ESM compatibility.
export default {
  options,
  parsers,
  printers,
} satisfies Plugin<string>
