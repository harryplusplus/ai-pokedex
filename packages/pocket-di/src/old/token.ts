import { type ClassDefinition } from './class-definition.ts'
import type { Declaration } from './declaration.ts'
import type { Injectable } from './injectable.ts'
import type { TypedToken } from './typed-token.ts'

export type Token<T extends Injectable> =
  | ClassDefinition<T, Declaration>
  | TypedToken<T>
  | string
  | symbol

export function isClassDefinitionToken(
  token: Token<Injectable>,
): token is ClassDefinition<Injectable, Declaration> {
  return typeof token === 'function'
}

export function tokenToString(token: Token<Injectable>): string {
  if (isClassDefinitionToken(token)) {
    return token.name
  }

  return token.toString()
}
