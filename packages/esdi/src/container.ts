import { AsyncLock } from './async-lock.ts'
import { ContainerContext } from './container-context.ts'
import { Resolver } from './resolver.ts'
import { inject, onClose } from './symbols.ts'
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
  type InjectableDefinition,
  isClassTokenDependencyDefinition,
  type OnCloseable,
} from './types.ts'

export class Container {
  #context = new ContainerContext()
  #lock = new AsyncLock()

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

  async close(): Promise<void> {
    return await this.#lock.acquire(async () => {
      await this.#close()
    })
  }

  async #close(): Promise<void> {
    const singletons = this.#context.singletons.values().toArray()
    this.#context.singletons.clear()

    singletons.reverse()

    for (const singleton of singletons) {
      if (onClose in singleton) {
        const onCloseable = singleton as OnCloseable

        try {
          await onCloseable[onClose]()
        } catch (e) {
          // TODO: logging
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
