import { AsyncLock } from './async-lock.ts'
import type { ClassDefinition } from './class-definition.ts'
import type { ClassProvider } from './class-provider.ts'
import { ContainerContext } from './container-context.ts'
import type { Declaration } from './declaration.ts'
import { Destroyer } from './destroyer.ts'
import type { FactoryProvider } from './factory-provider.ts'
import type { Injectable } from './injectable.ts'
import { InstanceResolver } from './instance-resolver.ts'
import { ParentContext } from './parent-context.ts'
import type { ProviderLike } from './provider.ts'
import { Registerer, type RegisterOptions } from './registerer.ts'
import type { Token } from './token.ts'
import type { ValueProvider } from './value-provider.ts'

export interface Options {
  parent?: ParentContext
}

export class Container {
  readonly #lock = new AsyncLock()
  readonly #context: ContainerContext

  constructor(options?: Options) {
    this.#context = new ContainerContext(options?.parent ?? null)
  }

  register<T extends Injectable>(
    token: Token<T>,
    provider: ValueProvider<T>,
    options?: RegisterOptions,
  ): this
  register<T extends Injectable, D extends Declaration>(
    token: Token<T>,
    provider: ClassProvider<T, D>,
    options?: RegisterOptions,
  ): this
  register<T extends Injectable, D extends Declaration>(
    token: Token<T>,
    provider: FactoryProvider<T, D>,
    options?: RegisterOptions,
  ): this
  register<T extends Injectable, D extends Declaration>(
    token: Token<T>,
    definition: ClassDefinition<T, D>,
    options?: RegisterOptions,
  ): this
  register<T extends Injectable, D extends Declaration>(
    token: Token<T>,
    providerLike: ProviderLike<T, D>,
    options?: RegisterOptions,
  ): this {
    new Registerer(this.#context).register(token, providerLike, options)

    return this
  }

  async destroy(): Promise<void> {
    await this.#lock.acquire(async () => {
      await new Destroyer(this.#context).destroy()
    })
  }

  createChild(): Container {
    return new Container({
      parent: new ParentContext(this.#context),
    })
  }

  async resolve<T extends Injectable>(token: Token<T>): Promise<T> {
    return await this.#lock.acquire(async () => {
      return await new InstanceResolver(this.#context).resolve(token)
    })
  }
}
