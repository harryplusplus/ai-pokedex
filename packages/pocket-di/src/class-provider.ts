import type { Declaration } from './declaration.ts'
import type { Injectable } from './injectable.ts'
import type { ProviderLike } from './provider.ts'
import type { Any, Constructor } from './utils.ts'

export interface ClassProvider<T extends Injectable> {
  useClass: Constructor<T>
}

export function defineClass<T extends Injectable>(
  provider: ClassProvider<T>,
): ClassProvider<T> {
  return provider
}

export function isClassProvider(
  providerLike: ProviderLike<Any, Declaration>,
): providerLike is ClassProvider<Any> {
  return 'useClass' in providerLike
}
