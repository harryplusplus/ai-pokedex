import type { CircularDependencyChecker } from '../circular-dependency-checker.ts'
import type { ClassProvider } from '../class-provider.ts'
import type { Declaration } from '../declaration.ts'
import type { FactoryProvider } from '../factory-provider.ts'
import type { Injectable } from '../injectable.ts'
import { isClassProvider, isFactoryProvider } from '../providable.ts'
import { RecordBuilder } from '../record-builder.ts'
import { inject } from '../symbols.ts'
import type { MaybePromise } from '../utils.ts'
import {
  type OnResolveDependencies,
  resolveRecursive,
} from './resolve-recursive.ts'

export type DependentProvider =
  | ClassProvider<Injectable, Declaration>
  | FactoryProvider<Injectable, Declaration>

export type DependencyMaybePromises = Record<string, MaybePromise<Injectable>>

export function getDependencyMaybePromises(
  context: {
    checker: CircularDependencyChecker
  },
  input: {
    provider: DependentProvider
    onResolveDependencies: OnResolveDependencies
  },
): DependencyMaybePromises {
  const { checker } = context
  const { provider, onResolveDependencies } = input

  const declaration = getDeclaration(provider)
  const builder = new RecordBuilder()

  for (const [name, item] of Object.entries(declaration)) {
    checker.push(item)

    const dependency = resolveRecursive({
      token: item,
      checker,
      onResolveDependencies,
    })

    builder.set(name, dependency)
  }

  return builder.build()
}

export function getDeclaration(provider: DependentProvider): Declaration {
  if (isClassProvider(provider)) {
    return provider.useClass[inject] ?? {}
  }

  if (isFactoryProvider(provider)) {
    return provider.inject ?? {}
  }

  const _: never = provider
  throw new Error('Unexpected provider.')
}
