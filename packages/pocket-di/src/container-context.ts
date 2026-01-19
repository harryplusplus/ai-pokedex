import { parse } from './init/parse.ts'
import type { Container } from './types/container.ts'
import type {
  ChildContainerOptions,
  ContainerContextOptions,
  ContainerOptions,
} from './types/container-options.ts'
import type { Injectable } from './types/injectable.ts'
import { type Provider } from './types/provider.ts'
import { type InjectionToken } from './types/token.ts'
import { AsyncLock } from './utils/async-lock.ts'

export type Providers = Map<InjectionToken, Provider>

export class ContainerContext implements Container {
  lock = new AsyncLock()
  children: ContainerContext[] = []
  providers: Map<InjectionToken, Provider>
  // TODO
  // singletons: Map<InjectionToken, Injectable>
  parent: ContainerContext | null
  destroyed = false

  constructor(options: ContainerContextOptions) {
    const { providers, parent } = parse(options)

    this.providers = providers
    this.parent = parent
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
      // this.singletons.clear()

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
