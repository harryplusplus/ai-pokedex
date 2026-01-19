import type { Injectable } from './injectable.ts'
import type { InjectableConstructor } from './injectable-constructor.ts'
import type { TypedToken } from './token.ts'

export type InjectDeclaration = TupleInjectDeclaration | RecordInjectDeclaration

export type TupleInjectDeclaration = readonly InjectDeclarationItem[]

export type RecordInjectDeclaration = Record<string, InjectDeclarationItem>

export function isTuple(x: InjectDeclaration): x is TupleInjectDeclaration {
  return Array.isArray(x)
}

export function isRecord(x: InjectDeclaration): x is RecordInjectDeclaration {
  return !Array.isArray(x)
}

export type InjectDeclarationItem<I extends Injectable = Injectable> =
  | TypedToken<I>
  | InjectableConstructor<I, InjectDeclaration>

export function isTypedToken(x: InjectDeclarationItem): x is TypedToken {
  return typeof x === 'string' || typeof x === 'symbol'
}

export function isInjectableConstructor(
  x: InjectDeclarationItem,
): x is InjectableConstructor {
  return typeof x === 'function'
}
