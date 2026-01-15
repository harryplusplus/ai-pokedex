import { formatSql } from 'psqlformat'

import { SqlAdapterConfig } from './packages/prettier-plugin-sql-adapter/dist'

export default {
  format: (input) => {
    const output = formatSql(input, {
      spaces: 2,
    })

    return output
  },
} satisfies SqlAdapterConfig
