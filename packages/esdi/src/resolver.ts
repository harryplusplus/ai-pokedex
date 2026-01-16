import { CircularDependencyChecker } from './circular-dependency-checker.js'
import type { ContainerContext } from './container-context.ts'
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

export class Resolver {
  readonly #context: ContainerContext

  constructor(context: ContainerContext) {
    this.#context = context
  }

  async resolve<T extends object>(token: InjectionToken<T>): Promise<T> {
    const checker = new CircularDependencyChecker()
    checker.push(token)

    const instance = await this.#resolve({
      token,
      checker,
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
    const checker = new CircularDependencyChecker()
    checker.push(token)

    const result = this.#resolve({
      token,
      checker,
      onAwaitOrThrow: this.#onThrow.bind(this),
    })

    if (result instanceof Promise) {
      throw new Error('Promise is not allowed.')
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
        throw new Error('Promise is not allowed.')
      }
    }

    this.#context.singletons.set(token, singleton)

    return singleton
  }

  #resolve(input: {
    token: InjectionToken<Any>
    checker: CircularDependencyChecker
    onAwaitOrThrow: (input: {
      token: InjectionToken<Any>
      injectableDef: InjectableDefinition<object>
      maybeDeps: MaybeDependencies
    }) => MaybePromise<object>
  }): MaybePromise<object> {
    const { token, checker, onAwaitOrThrow } = input

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

      checker.push(token)

      const maybeSingleton = this.#resolve({
        token,
        checker,
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
