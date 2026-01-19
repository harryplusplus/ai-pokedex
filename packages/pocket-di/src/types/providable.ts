import type { InjectDeclaration } from './inject-declaration.ts'
import type { Injectable } from './injectable.ts'
import type { InjectableConstructor } from './injectable-constructor.ts'
import type { Provider } from './provider.ts'

export type Providable<
  I extends Injectable = Injectable,
  ID extends InjectDeclaration = InjectDeclaration,
  C extends I = I,
> = Provider<I, ID, C> | InjectableConstructor<I, ID>

export function isProvider(x: Providable): x is Provider {
  return 'provide' in x
}

export function isInjectableConstructor(
  x: Providable,
): x is InjectableConstructor {
  return typeof x === 'function'
}

export function providableToProvider(x: Providable): Provider {
  if (isProvider(x)) {
    return x
  }

  if (isInjectableConstructor(x)) {
    return {
      provide: x,
      useClass: x,
    }
  }

  const _: never = x
  throw new Error('Unexpected providable.')
}
