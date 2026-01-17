import type { ClassDefinition } from './class-definition.ts'
import type { Any, Injectable } from './common.ts'
import type { Declaration } from './declaration.ts'
import type { type } from './symbol.ts'

export type PrimitiveToken = string | symbol

export type TypedToken<T extends Injectable> = PrimitiveToken & { [type]?: T }

export function token<T extends Injectable>(
  token: PrimitiveToken,
): TypedToken<T> {
  return token
}

export type IndirectToken<T extends Injectable> = TypedToken<T> | PrimitiveToken

export type ClassToken<T extends Injectable> = ClassDefinition<T, Declaration>

export type Token<T extends Injectable> = ClassToken<T> | IndirectToken<T>

export function isClassToken(token: Token<Any>): token is ClassToken<Any> {
  return typeof token === 'function'
}

export function isIndirectToken(
  token: Token<Any>,
): token is IndirectToken<Any> {
  return typeof token === 'string' || typeof token === 'symbol'
}

export function tokenToString(token: Token<Any>): string {
  if (isClassToken(token)) {
    return token.name
  }

  return token.toString()
}
