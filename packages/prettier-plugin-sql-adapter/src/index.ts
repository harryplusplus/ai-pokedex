import type { Plugin } from 'prettier'

import {
  options,
  type SqlAdapterConfig,
  type SqlAdapterOptions,
} from './options.ts'
import { parsers, printers } from './sql-adapter.ts'

// Named exports for CJS compatibility.
export {
  options,
  parsers,
  printers,
  type SqlAdapterConfig,
  type SqlAdapterOptions,
}

// Default export for ESM compatibility.
const plugin: Plugin<string> = {
  options,
  parsers,
  printers,
}

export default plugin
