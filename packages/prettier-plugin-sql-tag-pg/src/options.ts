import type { ParserOptions, SupportOption } from 'prettier'

export interface SqlTagPgOptions {
  sqlTagPgSpaces: number
}

export const options: Record<keyof SqlTagPgOptions, SupportOption> = {
  sqlTagPgSpaces: {
    category: 'SQL',
    type: 'int',
    default: 4,
    description: 'Use spaces for indentation (default 4 spaces)',
  },
}

export function resolveOptions(
  options: ParserOptions<string>,
): ParserOptions<string> & SqlTagPgOptions {
  const maybeSqlTagPgOptions = options as Partial<SqlTagPgOptions>

  const sqlTagPgOptions: SqlTagPgOptions = {
    sqlTagPgSpaces: Number(maybeSqlTagPgOptions.sqlTagPgSpaces ?? 4),
  }

  return {
    ...options,
    ...sqlTagPgOptions,
  }
}
