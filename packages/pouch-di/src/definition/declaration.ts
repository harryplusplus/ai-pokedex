import type { Any, Injectable } from './common.ts'
import { type } from './symbol.ts'
import type { DirectToken, IndirectToken, Token } from './token.ts'

//#region DeclarationItem

export type DirectDeclarationItem<T extends Injectable> = DirectToken<T>

export interface IndirectDeclarationItem<T extends Injectable> {
  token: IndirectToken<T>
  [type]?: T
}

export function indirect<T extends Injectable>(
  token: IndirectToken<T>,
): IndirectDeclarationItem<T> {
  return {
    token,
    [type]: undefined,
  }
}

export type DeclarationItem<T extends Injectable> =
  | DirectDeclarationItem<T>
  | IndirectDeclarationItem<T>

export function isDirectDeclarationItem(
  item: DeclarationItem<Any>,
): item is DirectDeclarationItem<Any> {
  return typeof item === 'function'
}

export function isIndirectDeclarationItem(
  item: DeclarationItem<Any>,
): item is IndirectDeclarationItem<Any> {
  return typeof item !== 'function'
}

export function declarationItemToToken(item: DeclarationItem<Any>): Token<Any> {
  return isDirectDeclarationItem(item) ? item : item.token
}

//#endregion DeclarationItem

export type Declaration = Record<string, DeclarationItem<Any>>

export type Context<D extends Declaration> = {
  [K in keyof D]: D[K] extends DeclarationItem<infer T> ? T : never
}

export type InstanceContext = Context<Declaration>
