import { type ClassProvider } from './class-provider.ts'
import type { Declaration } from './declaration.ts'
import { type FactoryProvider } from './factory-provider.ts'
import type { Injectable } from './injectable.ts'
import type { ValueProvider } from './value-provider.ts'

export type Provider<T extends Injectable, D extends Declaration> =
  | ValueProvider<T>
  | ClassProvider<T, D>
  | FactoryProvider<T, D>

export interface ValueProvider<T extends Injectable> {
  useValue: T
}

export interface ProviderFn<T extends Injectable> {
  <D extends Declaration>(provider: Provider<T, D>): Provider<T, D>
}

function defineProvider<T extends Injectable, D extends Declaration>(
  provider: Provider<T, D>,
): Provider<T, D>

function defineProvider<T extends Injectable>(): ProviderFn<T>

function defineProvider<T extends Injectable, D extends Declaration>(
  provider?: Provider<T, D>,
): Provider<T, D> | ProviderFn<T> {
  if (provider) {
    return provider
  }

  return (provider) => provider
}

export { defineProvider }
