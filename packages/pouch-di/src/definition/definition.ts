import type { ClassDefinition } from './class-definition.ts'
import type { Any, Injectable } from './common.ts'
import type { Declaration } from './declaration.ts'
import type { FactoryDefinition } from './factory-definition.ts'
import { inject } from './symbol.ts'
import type { Token } from './token.ts'

export type Definition<T extends Injectable, D extends Declaration> =
  | ClassDefinition<T, D>
  | FactoryDefinition<T, D>

export function isClassDefinition(
  definition: Definition<Any, Any>,
): definition is ClassDefinition<Injectable, Declaration> {
  return typeof definition === 'function'
}

export function isFactoryDefinition(
  definition: Definition<Any, Any>,
): definition is FactoryDefinition<Injectable, Declaration> {
  return typeof definition !== 'function'
}

export function definitionToToken(
  definition: Definition<Any, Any>,
): Token<Any> {
  if (isClassDefinition(definition)) {
    return definition
  } else if (isFactoryDefinition(definition)) {
    return definition.token
  } else {
    throw new Error('Invalid definition.')
  }
}

export function definitionToDeclaration(
  definition: Definition<Any, Any>,
): Declaration {
  if (isClassDefinition(definition)) {
    return definition[inject] ?? {}
  } else if (isFactoryDefinition(definition)) {
    return definition.inject ?? {}
  } else {
    throw new Error('Invalid definition.')
  }
}
