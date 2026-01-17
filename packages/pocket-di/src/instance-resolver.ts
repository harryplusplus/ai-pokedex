import { CircularDependencyChecker } from './circular-dependency-checker.ts'
import type { PostConstructable } from './class-definition.ts'
import { isClassProvider } from './class-provider.ts'
import type { ContainerContext } from './container-context.ts'
import type { Declaration } from './declaration.ts'
import type { Dependencies } from './dependencies.ts'
import { isFactoryProvider } from './factory-provider.ts'
import type { Injectable } from './injectable.ts'
import type { Lifecycle } from './lifecycle.ts'
import { inject, postConstruct } from './symbols.ts'
import { type Token, tokenToString } from './token.ts'
import type { Any } from './utils.ts'
import { isValueProvider } from './value-provider.ts'

export class InstanceResolver {
  readonly #context: ContainerContext

  constructor(context: ContainerContext) {
    this.#context = context
  }

  async resolve<T extends Injectable>(token: Token<T>): Promise<T> {
    const checker = new CircularDependencyChecker()
    checker.push(token)

    const instance = await this.#resolveRecursive({
      token,
      checker,
    })

    return instance as T
  }

  async #resolveRecursive(input: {
    token: Token<Any>
    checker: CircularDependencyChecker
  }): Promise<Injectable> {
    const { token, checker } = input

    const singleton = this.#context.getSingleton(token)
    if (singleton) {
      return singleton
    }

    const provider = this.#context.getProvider(token)
    if (!provider) {
      throw new Error(`"${tokenToString(token)}" is not registered.`)
    }

    if (isValueProvider(provider)) {
      return provider.useValue
    }

    if (isClassProvider(provider)) {
      const { useClass, lifecycle } = provider

      const dependencies: Dependencies<Declaration> =
        await this.#resolveDependencies({
          checker,
          declaration: useClass[inject] ?? {},
        })

      const instance = new useClass(dependencies)
      if (postConstruct in instance) {
        await (instance as PostConstructable)[postConstruct]()
      }

      this.#resolveLifecycle({
        token,
        instance,
        lifecycle,
      })

      return instance
    }

    if (isFactoryProvider(provider)) {
      const { inject, useFactory, lifecycle } = provider

      const dependencies: Dependencies<Declaration> =
        await this.#resolveDependencies({
          checker,
          declaration: inject ?? {},
        })

      const instance = await useFactory(dependencies)

      this.#resolveLifecycle({
        token,
        instance,
        lifecycle,
      })

      return instance
    }

    const _: never = provider
    throw new Error('Unexpected provider.')
  }

  async #resolveDependencies(input: {
    checker: CircularDependencyChecker
    declaration: Declaration
  }): Promise<Dependencies<Declaration>> {
    const { checker, declaration } = input

    const dependencies: Dependencies<Declaration> = {}

    for (const [name, item] of Object.entries(declaration)) {
      checker.push(item)

      const dependency = await this.#resolveRecursive({
        token: item,
        checker,
      })

      dependencies[name] = dependency
    }

    return dependencies
  }

  #resolveLifecycle(input: {
    token: Token<Any>
    instance: Injectable
    lifecycle?: Lifecycle
  }) {
    const { token, instance, lifecycle = 'singleton' } = input

    if (lifecycle === 'singleton') {
      this.#context.singletons.set(token, instance)
    }
  }
}
