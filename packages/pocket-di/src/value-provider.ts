import type { Declaration } from './declaration.ts'
import type { Injectable } from './injectable.ts'
import type { ProviderLike } from './provider.ts'
import type { Any } from './utils.ts'

export interface ValueProvider<T extends Injectable> {
  useValue: T
}

export function defineValue<T extends Injectable>(
  provider: ValueProvider<T>,
): ValueProvider<T> {
  return provider
}

export function isValueProvider(
  providerLike: ProviderLike<Any, Declaration>,
): providerLike is ValueProvider<Injectable> {
  return 'useValue' in providerLike
}
