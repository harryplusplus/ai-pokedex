import type { ClassDefinition } from './class-definition.ts'
import type { Declaration } from './declaration.ts'
import type { Injectable } from './injectable.ts'
import type { Lifecycle } from './lifecycle.ts'
import type { ProviderLike } from './provider.ts'
import type { Any } from './utils.ts'

export interface ClassProvider<T extends Injectable, D extends Declaration> {
  useClass: ClassDefinition<T, D>
  lifecycle?: Lifecycle
}

export function defineClass<T extends Injectable>(
  provider: ClassProvider<T, Declaration>,
): ClassProvider<T, Declaration> {
  return provider
}

export function isClassProvider(
  providerLike: ProviderLike<Any, Declaration>,
): providerLike is ClassProvider<Injectable, Declaration> {
  return 'useClass' in providerLike
}
