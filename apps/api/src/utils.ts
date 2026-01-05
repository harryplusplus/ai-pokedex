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
