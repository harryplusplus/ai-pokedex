import { AsyncLock } from './async-lock.ts'
import { ContainerContext } from './container-context.ts'
import { isClassTokenDependencyDefinition } from './dependency-definitions.ts'
import type { OnDestroyable } from './hooks.ts'
import type { InjectableDefinition } from './injectable-definition.ts'
import { Resolver } from './resolver.ts'
import { inject, onDestroy } from './symbols.ts'
import {
  type ClassToken,
  type IndirectToken,
  type InjectionToken,
  isClassToken,
  isIndirectToken,
  tokenToString,
} from './tokens.ts'
import type { Any, Logger } from './utils.ts'

export interface ContainerOptions {
  logger?: Logger
}

export class Container {
  #context = new ContainerContext()
  #lock = new AsyncLock()
  #options?: ContainerOptions

  constructor(options?: ContainerOptions) {
    this.#options = options
  }

  provide<T extends object>(token: ClassToken<T>): this
  provide<T extends object>(
    token: IndirectToken<T>,
    injectableDef: InjectableDefinition<T>,
  ): this
  provide<T extends object>(
    token: ClassToken<T> | IndirectToken<T>,
    injectableDef?: InjectableDefinition<T>,
  ): this {
    if (this.#context.injectableDefinitions.has(token)) {
      throw new Error(`${tokenToString(token)} already exists.`)
    }

    if (isClassToken(token)) {
      this.#context.injectableDefinitions.set(token, token)
    } else if (isIndirectToken(token)) {
      if (!injectableDef) {
        throw new Error(
          `${tokenToString(token)}'s injectable definition was not provided.`,
        )
      }

      this.#context.injectableDefinitions.set(token, injectableDef)
    } else {
      throw new Error(`${tokenToString(token)} is an invalid token.`)
    }

    return this
  }

  async resolve<T extends object>(token: InjectionToken<T>): Promise<T> {
    return await this.#lock.acquire(async () => {
      return await new Resolver(this.#context).resolve(token)
    })
  }

  resolveSync<T extends object>(token: InjectionToken<T>): T {
    return new Resolver(this.#context).resolveSync(token)
  }

  async destroy(): Promise<void> {
    return await this.#lock.acquire(async () => {
      await this.#destroy()
    })
  }

  async #destroy(): Promise<void> {
    const singletons = this.#context.singletons.values().toArray()
    this.#context.singletons.clear()

    singletons.reverse()

    for (const singleton of singletons) {
      if (onDestroy in singleton) {
        const onDestroyable = singleton as OnDestroyable

        try {
          await onDestroyable[onDestroy]()
        } catch (e) {
          this.#options?.logger?.error(e)
        }
      }
    }
  }

  validate(target: InjectionToken<Any>): void {
    let injectableDef = this.#context.injectableDefinitions.get(target)
    if (!injectableDef) {
      if (isClassToken(target)) {
        injectableDef = target
      } else {
        throw new Error(`${tokenToString(target)} was not provided.`)
      }
    }

    for (const [name, dependencyDef] of Object.entries(injectableDef[inject])) {
      if (isClassTokenDependencyDefinition(dependencyDef)) {
        this.validate(dependencyDef)
      } else {
        const { token } = dependencyDef
        const depInjectableDef = this.#context.injectableDefinitions.get(token)
        if (!depInjectableDef) {
          throw new Error(`${tokenToString(target)}.${name} was not provided.`)
        }

        this.validate(token)
      }
    }
  }
}
