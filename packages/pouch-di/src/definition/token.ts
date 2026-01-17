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

export type DirectToken<T extends Injectable> = ClassDefinition<T, Declaration>

export type Token<T extends Injectable> = DirectToken<T> | IndirectToken<T>

export function isDirectToken(token: Token<Any>): token is DirectToken<Any> {
  return typeof token === 'function'
}

export function isIndirectToken(
  token: Token<Any>,
): token is IndirectToken<Any> {
  return typeof token === 'string' || typeof token === 'symbol'
}

export function tokenToString(token: Token<Any>): string {
  if (isDirectToken(token)) {
    return token.name
  }

  return token.toString()
}
