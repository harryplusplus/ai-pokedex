import type { Injectable } from './injectable.ts'
import type { ClassToken, TypedToken } from './token.ts'
import type { Any } from './utils.ts'

//#region DeclarationItem

export type ClassDeclarationItem<T extends Injectable> = ClassToken<T>

export type TokenDeclarationItem<T extends Injectable> = TypedToken<T>

export type DeclarationItem<T extends Injectable> =
  | ClassDeclarationItem<T>
  | TokenDeclarationItem<T>

export function isClassDeclarationItem(
  item: DeclarationItem<Any>,
): item is ClassDeclarationItem<Any> {
  return typeof item === 'function'
}

export function isTokenDeclarationItem(
  item: DeclarationItem<Any>,
): item is TokenDeclarationItem<Any> {
  return typeof item !== 'function'
}

//#endregion DeclarationItem

export type Declaration = Record<string, DeclarationItem<Any>>
