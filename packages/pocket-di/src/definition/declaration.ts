import type { ClassDefinition } from './class-definition.ts'
import type { Any, Injectable } from './common.ts'
import { inject } from './symbol.ts'
import {
  type ClassToken,
  type IndirectToken,
  token,
  type TypedToken,
} from './token.ts'

//#region DeclarationItem

export type ClassDeclarationItem<T extends Injectable> = ClassToken<T>

export type IndirectDeclarationItem<T extends Injectable> = TypedToken<T>

export function indirect<T extends Injectable>(
  x: IndirectToken<T>,
): IndirectDeclarationItem<T> {
  return token(x)
}

export type DeclarationItem<T extends Injectable> =
  | ClassDeclarationItem<T>
  | IndirectDeclarationItem<T>

export function isClassDeclarationItem(
  item: DeclarationItem<Any>,
): item is ClassDeclarationItem<Any> {
  return typeof item === 'function'
}

export function isIndirectDeclarationItem(
  item: DeclarationItem<Any>,
): item is IndirectDeclarationItem<Any> {
  return typeof item !== 'function' && typeof item === 'object'
}

//#endregion DeclarationItem

export type Declaration = Record<string, DeclarationItem<Any>>

export type Dependencies<D extends Declaration> = {
  [K in keyof D]: D[K] extends DeclarationItem<infer T> ? T : never
}

export type InferDependencies<T extends ClassDefinition<Any, Any>> = T extends {
  [inject]?: infer D extends Declaration
}
  ? Dependencies<D>
  : never
