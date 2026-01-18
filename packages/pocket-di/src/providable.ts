import type { ClassDefinition } from './class-definition.ts'
import type { ClassProvider } from './class-provider.ts'
import type { Declaration } from './declaration.ts'
import type { FactoryProvider } from './factory-provider.ts'
import type { Injectable } from './injectable.ts'
import type { Provider } from './provider.ts'
import type { ValueProvider } from './value-provider.ts'

export type Providable<T extends Injectable, D extends Declaration> =
  | Provider<T, D>
  | ClassDefinition<T, D>

export function isClassDefinitionProvidable(
  providable: Providable<Injectable, Declaration>,
): providable is ClassDefinition<Injectable, Declaration> {
  return typeof providable === 'function'
}

export function isClassProvider(
  providable: Providable<Injectable, Declaration>,
): providable is ClassProvider<Injectable, Declaration> {
  return 'useClass' in providable
}

export function isFactoryProvider(
  providable: Providable<Injectable, Declaration>,
): providable is FactoryProvider<Injectable, Declaration> {
  return 'useFactory' in providable
}

export function isValueProvider(
  providable: Providable<Injectable, Declaration>,
): providable is ValueProvider<Injectable> {
  return 'useValue' in providable
}

export function isProvider(
  providable: Providable<Injectable, Declaration>,
): providable is Provider<Injectable, Declaration> {
  return (
    isValueProvider(providable) ||
    isClassProvider(providable) ||
    isFactoryProvider(providable)
  )
}
