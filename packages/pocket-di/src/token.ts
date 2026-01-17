import type { ClassDefinition } from './class-definition.ts'
import type { Declaration } from './declaration.ts'
import type { Injectable } from './injectable.ts'
import type { type } from './symbols.ts'
import type { Any } from './utils.ts'

export type PrimitiveToken = string | symbol

export type TypedToken<T extends Injectable> = PrimitiveToken & { [type]?: T }

export function token<T extends Injectable>(
  token: PrimitiveToken,
): TypedToken<T> {
  return token
}

export type ClassToken<T extends Injectable> = ClassDefinition<T, Declaration>

export type Token<T extends Injectable> =
  | ClassToken<T>
  | TypedToken<T>
  | PrimitiveToken

export function isClassToken(token: Token<Any>): token is ClassToken<Any> {
  return typeof token === 'function'
}

export function tokenToString(token: Token<Any>): string {
  if (isClassToken(token)) {
    return token.name
  }

  return token.toString()
}
