import type { Injectable } from './injectable.ts'
import type { InjectableClassDef } from './injectable-class-def.ts'
import type { InjectionDecl } from './injection-decl.ts'
import type { type } from './symbols.ts'
import type { Any } from './utils.ts'

export type PrimitiveToken = string | symbol

export type TypedToken<T extends Injectable> = PrimitiveToken & { [type]?: T }

export function token<T extends Injectable>(
  token: PrimitiveToken,
): TypedToken<T> {
  return token
}

export type IndirectToken<T extends Injectable> = TypedToken<T> | PrimitiveToken

export type DirectToken<T extends Injectable> = InjectableClassDef<
  T,
  InjectionDecl
>

export type InjectionToken<T extends Injectable> =
  | DirectToken<T>
  | IndirectToken<T>

export function isDirectToken(
  token: InjectionToken<Any>,
): token is DirectToken<Any> {
  return typeof token === 'function'
}

export function isIndirectToken(
  token: InjectionToken<Any>,
): token is IndirectToken<Any> {
  return typeof token === 'string' || typeof token === 'symbol'
}

export function tokenToString(token: InjectionToken<Any>): string {
  if (isDirectToken(token)) {
    return token.name
  }

  return token.toString()
}
