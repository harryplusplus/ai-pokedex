import type { Declaration } from './declaration.ts'
import type { Injectable } from './injectable.ts'
import type { Providable } from './providable.ts'
import type { inject } from './symbols.ts'
import type { Token } from './token.ts'
import type { Constructor } from './utils.ts'

export interface ClassDefinition<
  T extends Injectable,
  D extends Declaration,
> extends Constructor<T> {
  [inject]?: D
}

export function isClassDefinitionToken(
  token: Token<Injectable>,
): token is ClassDefinition<Injectable, Declaration> {
  return typeof token === 'function'
}

export function isClassDefinitionProvidable(
  providable: Providable<Injectable, Declaration>,
): providable is ClassDefinition<Injectable, Declaration> {
  return typeof providable === 'function'
}
