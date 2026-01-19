import type { Declaration } from './declaration.ts'
import type { Dependencies } from './dependencies.ts'
import type { Injectable } from './injectable.ts'
import type { Singleton, Transient } from './scope.ts'
import type { MaybePromise } from './utils.ts'

export interface SingletonFactoryProvider<
  T extends Injectable,
  D extends Declaration,
> {
  inject?: D
  useFactory: (dependencies: Dependencies<D>) => MaybePromise<T>
  preDestroy?: (instance: T) => MaybePromise<void>
  scope?: Singleton
}

export interface TransientFactoryProvider<
  T extends Injectable,
  D extends Declaration,
> {
  inject?: D
  useFactory: (dependencies: Dependencies<D>) => MaybePromise<T>
  preDestroy?: never
  scope: Transient
}

export type FactoryProvider<T extends Injectable, D extends Declaration> =
  | SingletonFactoryProvider<T, D>
  | TransientFactoryProvider<T, D>

export interface FactoryProviderFn<T extends Injectable> {
  <D extends Declaration>(
    provider: FactoryProvider<T, D>,
  ): FactoryProvider<T, D>
}
