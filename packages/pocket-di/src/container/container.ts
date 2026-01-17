import type { Any, Injectable } from '../definition/common.ts'
import { type Definition } from '../definition/definition.ts'
import { type Token } from '../definition/token.ts'
import { AsyncLock } from './async-lock.ts'
import { Destroyer } from './destroyer.ts'
import { type FilledOptions, fillOptions, type Options } from './options.ts'
import { Provider } from './provider.ts'
import { SingletonResolver } from './singleton-resolver.ts'
import { Validator } from './validator.ts'

export interface ContainerContext {
  readonly definitions: Map<Token<Any>, Definition<Any, Any>>
  readonly singletons: Map<Token<Any>, Injectable>
}

export class Container {
  readonly #lock = new AsyncLock()
  readonly #context: ContainerContext = {
    definitions: new Map(),
    singletons: new Map(),
  }
  readonly #options: FilledOptions

  constructor(options?: Options) {
    this.#options = fillOptions(options)
  }

  provide(definition: Definition<Any, Any>) {
    new Provider(this.#context, this.#options).provide(definition)

    return this
  }

  async resolve<T extends Injectable>(token: Token<T>): Promise<T> {
    return await this.#lock.acquire(async () => {
      return await new SingletonResolver(this.#context, this.#options).resolve(
        token,
      )
    })
  }

  resolveSync<T extends Injectable>(token: Token<T>): T {
    return new SingletonResolver(this.#context, this.#options).resolveSync(
      token,
    )
  }

  async destroy(): Promise<void> {
    await this.#lock.acquire(async () => {
      await new Destroyer(this.#context, this.#options).destroy()
    })
  }

  validate(target: Token<Any>): void {
    new Validator(this.#context).validate(target)
  }
}
