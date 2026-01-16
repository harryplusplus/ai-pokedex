import { type } from './symbols.ts'
import type { ClassToken, IndirectToken, InjectionToken } from './tokens.ts'
import type { Any } from './utils.ts'

export interface IndirectDependencyDefinition<T> {
  token: IndirectToken<T>
  [type]?: T
}

export function indirect<T extends object>(
  token: IndirectToken<T>,
): IndirectDependencyDefinition<T> {
  return {
    token,
    [type]: undefined,
  }
}

export type DependencyDefinition<T> =
  | ClassToken<T>
  | IndirectDependencyDefinition<T>

export function isClassTokenDependencyDefinition(
  definition: DependencyDefinition<Any>,
): definition is ClassToken<Any> {
  return typeof definition === 'function'
}

export function isIndirectDependencyDefinition(
  definition: DependencyDefinition<Any>,
): definition is IndirectDependencyDefinition<Any> {
  return typeof definition !== 'function' && typeof definition === 'object'
}

export function dependencyDefinitionToToken(
  definition: DependencyDefinition<Any>,
): InjectionToken<Any> {
  return isClassTokenDependencyDefinition(definition)
    ? definition
    : definition.token
}

export type DependencyDefinitions = Record<
  string,
  ClassToken<Any> | IndirectDependencyDefinition<Any>
>
