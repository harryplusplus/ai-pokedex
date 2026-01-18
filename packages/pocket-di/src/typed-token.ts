import type { Injectable } from './injectable.ts'
import type { type } from './symbols.ts'

export type TypedToken<T extends Injectable> = (string | symbol) & {
  [type]?: T
}

export function token<T extends Injectable>(
  token: string | symbol,
): TypedToken<T> {
  return token
}
