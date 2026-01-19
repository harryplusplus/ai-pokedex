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

export function providableToProvider(providable: Providable): Provider {
  if (isProviderProvidable(providable)) {
    return providable
  }

  if (isInjectableConstructorProvidable(providable)) {
    return {
      provide: providable,
      useClass: providable,
    }
  }

  const _: never = providable
  throw new Error('Unexpected providable.')
}
