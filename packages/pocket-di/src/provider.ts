import { type ClassDefinition, isClassDefinition } from './class-definition.ts'
import type { ClassProvider } from './class-provider.ts'
import type { Declaration } from './declaration.ts'
import type { FactoryProvider } from './factory-provider.ts'
import type { Injectable } from './injectable.ts'
import type { Any } from './utils.ts'
import type { ValueProvider } from './value-provider.ts'

export type Provider<T extends Injectable, D extends Declaration> =
  | ValueProvider<T>
  | ClassProvider<T, D>
  | FactoryProvider<T, D>

export function isProvider(
  providerLike: ProviderLike<Any, Declaration>,
): providerLike is Provider<Any, Declaration> {
  return !isClassDefinition(providerLike)
}

export type ProviderLike<T extends Injectable, D extends Declaration> =
  | Provider<T, D>
  | ClassDefinition<T, D>
