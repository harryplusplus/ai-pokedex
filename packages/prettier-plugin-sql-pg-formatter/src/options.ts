import type { SupportOption } from 'prettier'

export interface SqlPgFormatterOptions {
  a: string
}

export const options: Record<keyof SqlPgFormatterOptions, SupportOption> = {
  a: {
    category: 'Format',
    type: 'string',
    description: 'TODO',
  },
}
