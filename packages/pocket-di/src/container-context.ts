import type { Container } from './types/container.ts'
import type {
  ChildContainerOptions,
  ContainerContextOptions,
  ContainerOptions,
} from './types/container-options.ts'
import type { Injectable } from './types/injectable.ts'
import {
  isInjectableConstructorProvidable,
  isProviderProvidable,
  type Providable,
  providableToProvider,
} from './types/providable.ts'
import type { ClassProvider, Provider } from './types/provider.ts'
import { type InjectionToken, tokenToString } from './types/token.ts'
import { AsyncLock } from './utils/async-lock.ts'

export class ContainerContext implements Container {
  lock = new AsyncLock()
  children: ContainerContext[] = []
  providers: Map<InjectionToken, Provider>
  singletons: Map<InjectionToken, Injectable>
  parent: ContainerContext | null
  destroyed = false

  constructor(options: ContainerContextOptions) {
    this.parse(options)
    // this.parent = options.parent
  }

  async destroy(): Promise<void> {
    if (this.destroyed) {
      return
    }

    await this.lock.acquire(async () => {
      if (this.destroyed) {
        return
      }

      this.destroyed = true

      for (let i = this.children.length - 1; i >= 0; i--) {
        try {
          await this.children[i].destroy()
        } catch (_e) {
          // noop
        }
      }

      this.children.length = 0

      // TODO: destroy singletons
      this.singletons.clear()

      this.providers.clear()
      this.parent = null
    })
  }

  resolve<I extends Injectable>(token: InjectionToken<I>): Promise<I> {
    throw new Error('Method not implemented.')
  }

  resolveSync<I extends Injectable>(token: InjectionToken<I>): I {
    throw new Error('Method not implemented.')
  }

  createChild(options?: ChildContainerOptions): Container {
    throw new Error('Method not implemented.')
  }

  parse(input: ContainerContextOptions): void {
    const { parent = null, override = false } = input

    const providers: Map<InjectionToken, Provider> = new Map()
    for (const providable of input.providers) {
      const provider = providableToProvider(providable)

      const token = provider.provide
      if (parent?.hasProvider(token) && !override) {
        throw new Error(
          `Cannot register token "${tokenToString(token)}": already exists in parent container. Use override option to replace.`,
        )
      }

      if (providers.has(token)) {
        throw new Error(
          `Cannot register token "${tokenToString(token)}": duplicate registration in same container.`,
        )
      }

      providers.set(token, provider)
    }

    // TODO: check dependencies
  }

  ensureNotDestroyed(): void {
    if (this.destroyed) {
      throw new Error('Container is destroyed.')
    }
  }

  hasProvider(token: InjectionToken): boolean {
    this.ensureNotDestroyed()

    const provider = this.providers.get(token)
    if (provider) {
      return true
    }

    return this.parent?.hasProvider(token) ?? false
  }
}

export function createContainer(options: ContainerOptions): Container {
  return new ContainerContext(options)
}

//#region Internals

//#endregion Internals
