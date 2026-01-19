import type { CircularDependencyChecker } from '../circular-dependency-checker.ts'
import type { Injectable } from '../injectable.ts'
import {
  isClassProvider,
  isFactoryProvider,
  isValueProvider,
} from '../providable.ts'
import { type Token, tokenToString } from '../token.ts'
import type { MaybePromise } from '../utils.ts'
import {
  type DependencyMaybePromises,
  getDependencyMaybePromises,
} from './get-dependency-maybe-promises.ts'
import { getProvider } from './get-provider.ts'
import { getSingleton } from './get-singleton.ts'

interface OnResolveDependenciesInput {
  dependencyMaybePromises: DependencyMaybePromises
  provider: DependentProvider
  singletons: Singletons
  token: Token<Injectable>
}

export interface OnResolveDependencies {
  (input: OnResolveDependenciesInput): MaybePromise<Injectable>
}

export function resolveRecursive(input: {
  token: Token<Injectable>
  checker: CircularDependencyChecker
  onResolveDependencies: OnResolveDependencies
}): MaybePromise<Injectable> {
  const { context, token, checker, resolveDependencies } = input

  const singleton = getSingleton({
    parent: context.parent,
    singletons: context.singletons,
    token,
  })

  if (singleton) {
    return singleton
  }

  const provider = getProvider(context, token)
  if (!provider) {
    throw new Error(`Token "${tokenToString(token)}" not found.`)
  }

  if (isValueProvider(provider)) {
    return provider.useValue
  }

  if (isClassProvider(provider) || isFactoryProvider(provider)) {
    const dependencyMaybePromises = getDependencyMaybePromises({
      context,
      checker,
      provider,
      resolveDependencies,
    })

    return resolveDependencies({
      dependencyMaybePromises,
      provider,
      singletons: context.singletons,
      token,
    })
  }

  const _: never = provider
  throw new Error('Unexpected provider.')
}
