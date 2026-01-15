import type { type } from './symbols.ts'
import type { Any, Injectable } from './types.ts'

export type PrimitiveToken = string | symbol

export type TypedToken<T> = PrimitiveToken & { [type]?: T }

export function token<T>(token: PrimitiveToken): TypedToken<T> {
  return token
}

export type IndirectToken<T> = TypedToken<T> | PrimitiveToken

export type ClassToken<T> = Injectable<T>

export type InjectionToken<T> = ClassToken<T> | IndirectToken<T>

export function isClassToken(
  token: InjectionToken<Any>,
): token is ClassToken<Any> {
  return typeof token === 'function'
}

export function isIndirectToken(
  token: InjectionToken<Any>,
): token is IndirectToken<Any> {
  return typeof token === 'string' || typeof token === 'symbol'
}

export function tokenToString(token: InjectionToken<Any>): string {
  if (isClassToken(token)) {
    return token.name
  }

  return token.toString()
}
