import {
  type ClassDefinition,
  isClassDefinitionToken,
} from './class-definition.ts'
import type { Declaration } from './declaration.ts'
import type { Injectable } from './injectable.ts'
import type { type } from './symbols.ts'

export type TypedToken<T extends Injectable> = (string | symbol) & {
  [type]?: T
}

export function token<T extends Injectable>(
  token: string | symbol,
): TypedToken<T> {
  return token
}

export type Token<T extends Injectable> =
  | ClassDefinition<T, Declaration>
  | TypedToken<T>
  | string
  | symbol

export function tokenToString(token: Token<Injectable>): string {
  if (isClassDefinitionToken(token)) {
    return token.name
  }

  return token.toString()
}
