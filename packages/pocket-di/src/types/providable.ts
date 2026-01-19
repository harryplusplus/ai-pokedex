import type { InjectDeclaration } from './inject-declaration.ts'
import type { Injectable } from './injectable.ts'
import type { InjectableConstructor } from './injectable-constructor.ts'
import type { Provider } from './provider.ts'

export type Providable<
  I extends Injectable = Injectable,
  ID extends InjectDeclaration = InjectDeclaration,
  C extends I = I,
> = Provider<I, ID, C> | InjectableConstructor<I, ID>

export function isProviderProvidable(
  providable: Providable,
): providable is Provider {
  return 'provide' in providable
}

export function isInjectableConstructorProvidable(
  providable: Providable,
): providable is InjectableConstructor {
  return typeof providable === 'function'
}
