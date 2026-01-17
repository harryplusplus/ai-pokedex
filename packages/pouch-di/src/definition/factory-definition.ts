import type { Injectable, MaybePromise } from './common.ts'
import type { Context, Declaration } from './declaration.ts'
import type { IndirectToken } from './token.ts'

export interface FactoryDefinition<
  T extends Injectable,
  D extends Declaration,
> {
  token: IndirectToken<T>
  inject?: D
  fn: (c: Context<D>) => MaybePromise<T>
  on?: {
    destroy?: (self: T) => MaybePromise<void>
  }
}

export interface FactoryDefinitionFn<T extends Injectable> {
  <D extends Declaration>(
    definition: FactoryDefinition<T, D>,
  ): FactoryDefinition<T, D>
}

function define<T extends Injectable, D extends Declaration>(
  definition: FactoryDefinition<T, D>,
): FactoryDefinition<T, D>

function define<T extends Injectable>(): FactoryDefinitionFn<T>

function define<T extends Injectable, D extends Declaration>(
  definition?: FactoryDefinition<T, D>,
): FactoryDefinition<T, D> | FactoryDefinitionFn<T> {
  if (definition) {
    return definition
  }

  return (definition) => define(definition)
}

export { define }
