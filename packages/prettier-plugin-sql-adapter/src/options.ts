import type { ParserOptions, PathSupportOption, SupportOption } from 'prettier'

export interface SqlAdapterOptions {
  sqlAdapterConfig: string
}

const DEFAULT_SQL_ADAPTER_CONFIG = 'sql-adapter.config.{ts,mts,cts,js,mjs,cjs}'

export const options: Record<keyof SqlAdapterOptions, SupportOption> = {
  sqlAdapterConfig: {
    category: 'SQL',
    type: 'path',
    default: DEFAULT_SQL_ADAPTER_CONFIG,
    description: `Path to a SQL adapter configuration file (${DEFAULT_SQL_ADAPTER_CONFIG}).`,
  } satisfies PathSupportOption,
}

export function fillOptions(
  options: ParserOptions<string>,
): ParserOptions<string> & SqlAdapterOptions {
  const { sqlAdapterConfig = DEFAULT_SQL_ADAPTER_CONFIG } =
    options as Partial<SqlAdapterOptions>

  const sqlAdapterOptions: SqlAdapterOptions = {
    sqlAdapterConfig,
  }

  return {
    ...options,
    ...sqlAdapterOptions,
  }
}

export interface SqlAdapterConfig {
  format: (input: string) => string | Promise<string>
}
