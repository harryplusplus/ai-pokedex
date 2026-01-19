import type { Injectable } from './injectable.ts'
import type { InjectableConstructor } from './injectable-constructor.ts'
import type { TypedToken } from './token.ts'

export type InjectDeclaration = TupleInjectDeclaration | RecordInjectDeclaration

export type TupleInjectDeclaration = readonly InjectDeclarationItem[]

export type RecordInjectDeclaration = Record<string, InjectDeclarationItem>

export type InjectDeclarationItem<I extends Injectable = Injectable> =
  | TypedToken<I>
  | InjectableConstructor<I, InjectDeclaration>

export function isTupleInjectDeclaration(
  injectDeclaration: InjectDeclaration,
): injectDeclaration is TupleInjectDeclaration {
  return Array.isArray(injectDeclaration)
}

export function isRecordInjectDeclaration(
  injectDeclaration: InjectDeclaration,
): injectDeclaration is RecordInjectDeclaration {
  return !Array.isArray(injectDeclaration)
}
