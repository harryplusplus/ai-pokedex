import type { Any } from '../definition/common.ts'

export type LogLevel = 'debug' | 'error'

export const logLevelNumbers: Record<LogLevel, number> = {
  debug: 40,
  error: 10,
}

export function isLoggingAvailable(
  target: LogLevel,
  current: LogLevel,
): boolean {
  return logLevelNumbers[current] >= logLevelNumbers[target]
}

export interface Logger {
  debug?: (...data: Any[]) => void
  error?: (...data: Any[]) => void
}

export class DefaultLogger implements Required<Logger> {
  readonly #logLevel: LogLevel
  readonly #logger: Logger

  constructor(logLevel: LogLevel, logger: Logger) {
    this.#logLevel = logLevel
    this.#logger = logger
  }

  debug(...data: Any[]): void {
    if (isLoggingAvailable('debug', this.#logLevel)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.#logger.debug?.(...data)
    }
  }

  error(...data: Any[]): void {
    if (isLoggingAvailable('error', this.#logLevel)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.#logger.error?.(...data)
    }
  }
}

export interface Options {
  logLevel?: LogLevel
  logger?: Logger
}

export interface FilledOptions {
  logger: Required<Logger>
}

export function fillOptions(options?: Options): FilledOptions {
  const { logLevel = 'error', logger = console } = options ?? {}

  return {
    logger: new DefaultLogger(logLevel, logger),
  }
}
