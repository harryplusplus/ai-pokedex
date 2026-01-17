import type { Declaration } from './declaration.ts'
import type { Dependencies } from './dependencies.ts'
import type { Injectable } from './injectable.ts'
import type { ProviderLike } from './provider.ts'
import type { Any, MaybePromise } from './utils.ts'

export interface FactoryProvider<T extends Injectable, D extends Declaration> {
  inject?: D
  useFactory: (dependencies: Dependencies<D>) => MaybePromise<T>
  preDestroy?: (instance: T) => MaybePromise<void>
}

export interface FactoryProviderFn<T extends Injectable> {
  <D extends Declaration>(
    provider: FactoryProvider<T, D>,
  ): FactoryProvider<T, D>
}

function defineFactory<T extends Injectable, D extends Declaration>(
  provider: FactoryProvider<T, D>,
): FactoryProvider<T, D>

function defineFactory<T extends Injectable>(): FactoryProviderFn<T>

function defineFactory<T extends Injectable, D extends Declaration>(
  provider?: FactoryProvider<T, D>,
): FactoryProvider<T, D> | FactoryProviderFn<T> {
  if (provider) {
    return provider
  }

  return (provider) => defineFactory(provider)
}

export { defineFactory }

export function isFactoryProvider(
  providerLike: ProviderLike<Any, Declaration>,
): providerLike is FactoryProvider<Any, Declaration> {
  return 'useFactory' in providerLike
}
