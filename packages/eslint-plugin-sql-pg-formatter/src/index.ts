import { ESLint } from 'eslint'

import format from './rules/format.js'

const PLUGIN_NAME = 'sql-pg-formatter'

const plugin: ESLint.Plugin = {
  meta: {
    name: `eslint-plugin-${PLUGIN_NAME}`,
  },
  rules: {
    format,
  },
}

const configs: ESLint.Plugin['configs'] = {
  recommended: {
    plugins: {
      [PLUGIN_NAME]: plugin,
    },
    rules: {
      [`${PLUGIN_NAME}/format`]: 'error',
    },
  },
}

plugin.configs = configs

export default plugin
