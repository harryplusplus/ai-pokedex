import { NAMESPACE } from './namespace.ts'

export const inject: unique symbol = Symbol(desc('inject'))

export const type: unique symbol = Symbol(desc('type'))

export const postConstruct: unique symbol = Symbol(desc('postConstruct'))

export const preDestroy: unique symbol = Symbol(desc('preDestroy'))

//#region Internals

function desc(x: string): string {
  return `${NAMESPACE}:${x}`
}

//#endregion Internal
