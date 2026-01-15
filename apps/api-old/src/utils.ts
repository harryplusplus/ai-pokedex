import z from 'zod'

export function checkTimeZone(): void {
  const offset = new Date().getTimezoneOffset()
  if (offset !== 0) {
    throw new Error(`The time zone must be UTC. offset: ${offset}`)
  }
}

const NodeEnv = z.enum(['development', 'production'])
type NodeEnv = z.infer<typeof NodeEnv>

export function checkNodeEnv(): void {
  NodeEnv.parse(process.env.NODE_ENV)
}

export function toPrintable(e: unknown): Error | string {
  if (e instanceof Error || typeof e === 'string') {
    return e
  }

  if (typeof e === 'object' && e && 'message' in e) {
    return String(e.message)
  }

  return JSON.stringify(e)
}

export function toStack(e: unknown): string | undefined {
  if (e instanceof Error) {
    return e.stack
  }

  return undefined
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type Class = Function & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): any
}
