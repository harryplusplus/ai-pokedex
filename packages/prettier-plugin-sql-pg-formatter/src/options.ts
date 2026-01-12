import type { SupportOption } from 'prettier'

export interface SqlPgFormatterOptions {
  sqlPgFormatterSpaces: number
}

export const options: Record<keyof SqlPgFormatterOptions, SupportOption> = {
  sqlPgFormatterSpaces: {
    category: 'SQL',
    type: 'int',
    default: 4,
    description: 'Use spaces for indentation (default 4 spaces)',
  },
}
