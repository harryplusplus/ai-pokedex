import type { Context } from './context.ts'
import { MaybeDependencies } from './maybe-dependencies.js'
import { inject, onCreate } from './symbols.ts'
import { type InjectionToken, isClassToken, tokenToString } from './token.ts'
import {
  type Any,
  dependencyDefinitionToToken,
  type InjectableDefinition,
  type MaybePromise,
  type OnCreatable,
} from './types.ts'

export class SingletonResolver {
  readonly #context: Context

  constructor(context: Context) {
    this.#context = context
  }

  async resolve<T extends object>(token: InjectionToken<T>): Promise<T> {
    const instance = await this.#resolve({
      token,
      callChain: new Set([token]),
      onAwaitOrThrow: this.#onAwait.bind(this),
    })

    return instance as T
  }

  async #onAwait(input: {
    token: InjectionToken<Any>
    injectableDef: InjectableDefinition<object>
    maybeDeps: MaybeDependencies
  }): Promise<object> {
    const { token, injectableDef, maybeDeps } = input

    const deps = await maybeDeps.get()
    const singleton = new injectableDef(deps)

    if (onCreate in singleton) {
      const onCreatable = singleton as OnCreatable

      await onCreatable[onCreate]()
    }

    this.#context.singletons.set(token, singleton)

    return singleton
  }

  resolveSync<T extends object>(token: InjectionToken<T>): T {
    const result = this.#resolve({
      token,
      callChain: new Set([token]),
      onAwaitOrThrow: this.#onThrow.bind(this),
    })

    if (result instanceof Promise) {
      throw new Error('TODO')
    }

    return result as T
  }

  #onThrow(input: {
    token: InjectionToken<Any>
    injectableDef: InjectableDefinition<object>
    maybeDeps: MaybeDependencies
  }): object {
    const { token, injectableDef, maybeDeps } = input

    const deps = maybeDeps.getSync()
    const singleton = new injectableDef(deps)

    if (onCreate in singleton) {
      const onCreatable = singleton as OnCreatable

      const result = onCreatable[onCreate]()
      if (result instanceof Promise) {
        throw new Error('TODO')
      }
    }

    this.#context.singletons.set(token, singleton)

    return singleton
  }

  #resolve(input: {
    token: InjectionToken<Any>
    callChain: Set<InjectionToken<Any>>
    onAwaitOrThrow: (input: {
      token: InjectionToken<Any>
      injectableDef: InjectableDefinition<object>
      maybeDeps: MaybeDependencies
    }) => MaybePromise<object>
  }): MaybePromise<object> {
    const { token, callChain, onAwaitOrThrow } = input

    const singleton = this.#context.singletons.get(token)
    if (singleton) {
      return singleton
    }

    const injectableDef = this.#getOrUpdateInjectableDefinition(token)

    const maybeDeps = new MaybeDependencies()

    for (const [name, dependencyDef] of Object.entries(injectableDef[inject])) {
      const token = dependencyDefinitionToToken(dependencyDef)

      const singleton = this.#context.singletons.get(token)
      if (singleton) {
        maybeDeps.set(name, singleton)

        continue
      }

      updateCallChain(callChain, token)

      const maybeSingleton = this.#resolve({
        token,
        callChain,
        onAwaitOrThrow,
      })

      maybeDeps.set(name, maybeSingleton)
    }

    return onAwaitOrThrow({
      token,
      injectableDef,
      maybeDeps,
    })
  }

  #getOrUpdateInjectableDefinition(
    token: InjectionToken<object>,
  ): InjectableDefinition<object> {
    const definition = this.#context.injectableDefinitions.get(token)
    if (definition) {
      return definition
    }

    if (isClassToken(token)) {
      // NOTE: Auto providing.

      this.#context.injectableDefinitions.set(token, token)
      return token
    }

    throw new Error(`${tokenToString(token)} was not provided.`)
  }
}

function updateCallChain(
  callChain: Set<InjectionToken<Any>>,
  token: InjectionToken<Any>,
): void {
  if (callChain.has(token)) {
    throw new Error(
      `Circular dependency detected. ${[...callChain.values(), token]
        .map((x) => tokenToString(x))
        .join(' -> ')}`,
    )
  }

  callChain.add(token)
}
