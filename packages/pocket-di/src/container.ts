import { AsyncLock } from './async-lock.ts'
import type { ClassDefinition } from './class-definition.ts'
import type { ContainerContext } from './container-context.ts'
import type { Declaration } from './declaration.ts'
import { destroy } from './destroy.ts'
import type { Injectable } from './injectable.ts'
import type { Options } from './options.ts'
import { ParentContainer } from './parent-container.ts'
import type { Providable } from './providable.ts'
import type { Provider } from './provider.ts'
import { register } from './register.ts'
import { resolve, resolveSync } from './resolve.ts'
import type { Token } from './token.ts'

export class Container {
  readonly #lock = new AsyncLock()
  readonly #context: ContainerContext

  constructor(options?: Options) {
    this.#context = {
      providers: new Map(),
      singletons: new Map(),
      parent: options?.parent ?? null,
    }
  }

  register<T extends Injectable, D extends Declaration>(
    token: Token<T>,
    provider: Provider<T, D>,
  ): this

  register<T extends Injectable, D extends Declaration>(
    token: Token<T>,
    definition: ClassDefinition<T, D>,
  ): this

  register<T extends Injectable, D extends Declaration>(
    definition: ClassDefinition<T, D>,
  ): this

  register<T extends Injectable, D extends Declaration>(
    token: Token<T>,
    providable?: Providable<T, D>,
  ): this {
    register({
      providers: this.#context.providers,
      token,
      providable,
    })

    return this
  }

  async destroy(): Promise<void> {
    await this.#lock.acquire(async () => {
      await destroy(this.#context)
    })
  }

  async resolve<T extends Injectable>(token: Token<T>): Promise<T> {
    return await this.#lock.acquire(async () => {
      return await resolve({
        context: this.#context,
        token,
      })
    })
  }

  resolveSync<T extends Injectable>(token: Token<T>): T {
    return resolveSync({
      context: this.#context,
      token,
    })
  }

  createChild(): Container {
    return new Container({
      parent: new ParentContainer(this.#context),
    })
  }
}
