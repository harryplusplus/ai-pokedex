import type { ParserOptions, SupportOption } from 'prettier'

export interface PgOptions {
  pgSpaces: number
}

export const options: Record<keyof PgOptions, SupportOption> = {
  pgSpaces: {
    category: 'SQL',
    type: 'int',
    default: 4,
    description: 'Use spaces for indentation (default 4 spaces)',
  },
}

export function resolveOptions(
  options: ParserOptions<string>,
): ParserOptions<string> & PgOptions {
  return {
    ...options,
    pgSpaces: Number(options.pgSpaces ?? 4),
  }
}
