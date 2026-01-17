import { NAMESPACE } from './common.ts'

function desc(x: string): string {
  return `${NAMESPACE}.${x}`
}

export const inject: unique symbol = Symbol(desc('inject'))

export const type: unique symbol = Symbol(desc('type'))

export const onCreate: unique symbol = Symbol(desc('onCreate'))

export const onDestroy: unique symbol = Symbol(desc('onDestroy'))
