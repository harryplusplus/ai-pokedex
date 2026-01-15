import { inject, onCreate, onDestroy } from './symbols.ts'
import {
  type ClassToken,
  type IndirectToken,
  type InjectionToken,
  isClassToken,
  isIndirectToken,
  tokenToString,
} from './token.ts'
import {
  type Any,
  type Injectable,
  isClassTokenDependency,
  type OnCreatable,
  type OnDestroyable,
} from './types.ts'

export class Container {
  #injectables = new Map<InjectionToken<Any>, Injectable<Any>>()
  #singletons = new Map<InjectionToken<Any>, object>()

  provide<T extends object>(classToken: ClassToken<T>): this
  provide<T extends object>(
    indirectToken: IndirectToken<T>,
    injectable: Injectable<T>,
  ): this
  provide<T extends object>(
    classOrIndirectToken: ClassToken<T> | IndirectToken<T>,
    injectableOrUndefined?: Injectable<T>,
  ): this {
    if (this.#injectables.has(classOrIndirectToken)) {
      throw new Error(`${tokenToString(classOrIndirectToken)} already exists.`)
    }

    if (isClassToken(classOrIndirectToken)) {
      this.#injectables.set(classOrIndirectToken, classOrIndirectToken)
    } else if (isIndirectToken(classOrIndirectToken)) {
      if (!injectableOrUndefined) {
        throw new Error(
          `${tokenToString(classOrIndirectToken)}'s injectable was not provided.`,
        )
      }

      this.#injectables.set(classOrIndirectToken, injectableOrUndefined)
    } else {
      throw new Error(
        `${tokenToString(classOrIndirectToken)} is an invalid token.`,
      )
    }

    return this
  }

  async resolve<T extends object>(
    injectionToken: InjectionToken<T>,
  ): Promise<T> {
    return this.#resolve(injectionToken, new Set([injectionToken]))
  }

  async destroy(): Promise<void> {
    const singletons = this.#singletons.values().toArray()
    this.#singletons.clear()

    singletons.reverse()

    for (const singleton of singletons) {
      if (onDestroy in singleton) {
        const onDestroyable = singleton as OnDestroyable

        try {
          await onDestroyable[onDestroy]()
        } catch (_e) {
          // TODO: logging
        }
      }
    }
  }

  validate(target: InjectionToken<Any>): void {
    let injectable = this.#injectables.get(target)
    if (!injectable) {
      if (isClassToken(target)) {
        injectable = target
      } else {
        throw new Error(`${tokenToString(target)} was not provided.`)
      }
    }

    const dependencies = injectable[inject]

    for (const [name, dependency] of Object.entries(dependencies)) {
      if (isClassTokenDependency(dependency)) {
        this.validate(dependency)
      } else {
        const { token } = dependency
        const depInjectable = this.#injectables.get(token)
        if (!depInjectable) {
          throw new Error(`${tokenToString(target)}.${name} was not provided.`)
        }

        this.validate(token)
      }
    }
  }

  async #resolve<T extends object>(
    injectionToken: InjectionToken<T>,
    callChain: Set<InjectionToken<Any>>,
  ): Promise<T> {
    const singleton = this.#singletons.get(injectionToken)
    if (singleton) {
      return singleton as T
    }

    let injectable = this.#injectables.get(injectionToken)
    if (!injectable) {
      if (isClassToken(injectionToken)) {
        // auto providing

        this.#injectables.set(injectionToken, injectionToken)
        injectable = injectionToken
      } else {
        throw new Error(`${tokenToString(injectionToken)} was not provided.`)
      }
    }

    const depInstances: Record<string, object> = {}

    for (const [name, dependency] of Object.entries(injectable[inject])) {
      const token = isClassTokenDependency(dependency)
        ? dependency
        : dependency.token

      const singleton = this.#singletons.get(token)
      if (singleton) {
        depInstances[name] = singleton

        continue
      }

      if (callChain.has(token)) {
        throw new Error(
          `Circular dependency detected. ${[...callChain.values(), token]
            .map((x) => tokenToString(x))
            .join(' -> ')}`,
        )
      }

      callChain.add(token)

      const instance = this.#resolve<object>(token, callChain)

      depInstances[name] = instance
    }

    const instance = new injectable(depInstances) as T

    if (onCreate in instance) {
      const onCreatable = instance as OnCreatable

      await onCreatable[onCreate]()
    }

    this.#singletons.set(injectionToken, instance)

    return instance
  }
}
