import type { Injectable } from './injectable.ts'
import { type } from './symbols.ts'
import type { DirectToken, IndirectToken, InjectionToken } from './tokens.ts'
import type { Any } from './utils.ts'

export type DirectInjectionDeclItem<T extends Injectable> = DirectToken<T>

export interface IndirectInjectionDeclItem<T extends Injectable> {
  token: IndirectToken<T>
  [type]?: T
}

export function indirect<T extends Injectable>(
  token: IndirectToken<T>,
): IndirectInjectionDeclItem<T> {
  return {
    token,
    [type]: undefined,
  }
}

export type InjectionDeclItem<T extends Injectable> =
  | DirectInjectionDeclItem<T>
  | IndirectInjectionDeclItem<T>

export function isDirectInjectionDeclItem(
  item: InjectionDeclItem<Any>,
): item is DirectInjectionDeclItem<Any> {
  return typeof item === 'function'
}

export function isIndirectInjectionDeclItem(
  item: InjectionDeclItem<Any>,
): item is IndirectInjectionDeclItem<Any> {
  return typeof item !== 'function'
}

export function injectionDeclItemToToken(
  item: InjectionDeclItem<Any>,
): InjectionToken<Any> {
  return isDirectInjectionDeclItem(item) ? item : item.token
}

export type InjectionDecl = Record<string, InjectionDeclItem<Any>>
