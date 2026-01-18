import type { Declaration } from '../declaration.ts'
import type { Dependencies } from '../dependencies.ts'
import type { Injectable } from '../injectable.ts'
import type { PostConstructable } from '../lifecycle-callbacks.ts'
import { isClassProvider, isFactoryProvider } from '../providable.ts'
import { postConstruct } from '../symbols.ts'
import { type Token, tokenToString } from '../token.ts'
import type { MaybePromise } from '../utils.ts'
import type { DependentProvider } from './get-dependency-maybe-promises.ts'

export function createInstance(input: {
  token: Token<Injectable>
  provider: DependentProvider
  dependencies: Dependencies<Declaration>
  sync: boolean
}): MaybePromise<Injectable> {
  const { token, provider, dependencies, sync } = input

  if (isClassProvider(provider)) {
    const { useClass } = provider

    const instance = new useClass(dependencies)

    let postConstructResult: MaybePromise<void> | null = null
    if (postConstruct in instance) {
      postConstructResult = (instance as PostConstructable)[postConstruct]()
    }

    if (postConstructResult instanceof Promise) {
      if (sync) {
        throw new Error(
          `Cannot resolve "${tokenToString(token)}" (${useClass.name}) synchronously: postConstruct returns Promise.`,
        )
      }

      return postConstructResult.then(() => instance)
    }

    return instance
  }

  if (isFactoryProvider(provider)) {
    const factoryResult = provider.useFactory(dependencies)

    if (factoryResult instanceof Promise) {
      if (sync) {
        throw new Error(
          `Cannot resolve "${tokenToString(token)}" synchronously: useFactory returns Promise.`,
        )
      }
    }

    return factoryResult
  }

  const _: never = provider
  throw new Error('Unexpected provider.')
}
