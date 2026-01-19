import { AsyncLock } from './async-lock.ts'
import { parse } from './init/parse.ts'
import type { Container } from './types/container.ts'
import type {
  ChildContainerOptions,
  ContainerContextOptions,
  ContainerOptions,
} from './types/container-options.ts'
import type { Injectable } from './types/injectable.ts'
import { isPreDestroyable } from './types/lifecycle-events.ts'
import { type Provider } from './types/provider.ts'
import * as ProviderModule from './types/provider.ts'
import { preDestroy } from './types/symbols.ts'
import { type InjectionToken, tokenToString } from './types/token.ts'

export type Providers = Map<InjectionToken, Provider>

export type Singletons = Map<InjectionToken, Injectable>

export class ContainerContext implements Container {
  lock = new AsyncLock()
  children: ContainerContext[] = []
  singletons: Singletons = new Map()
  providers: Map<InjectionToken, Provider>
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

      {
        for (let i = this.children.length - 1; i >= 0; i--) {
          try {
            await this.children[i].destroy()
          } catch (_e) {
            // noop
          }
        }

        this.children.length = 0
      }

      {
        const copiedSingletons = [...this.singletons.entries()]
        this.singletons.clear()
        copiedSingletons.reverse()

        for (const [token, singleton] of copiedSingletons) {
          const provider = this.findProvider(token)
          if (!provider) {
            throw new Error(`Token "${tokenToString(token)}" not found.`)
          }

          if (ProviderModule.isValue(provider)) {
            // noop

            continue
          }

          if (ProviderModule.isClass(provider)) {
            if (isPreDestroyable(singleton)) {
              try {
                await singleton[preDestroy]()
              } catch (_e) {
                // noop
              }
            }

            continue
          }

          if (ProviderModule.isFactory(provider)) {
            try {
              await provider.preDestroy?.(singleton)
            } catch (_e) {
              // noop
            }

            continue
          }

          const _: never = provider
          throw new Error('Unexpected provider.')
        }
      }

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

  createChild(options: ChildContainerOptions): Container {
    this.ensureNotDestroyed()

    const child = new ContainerContext({
      ...options,
      parent: this,
    })

    this.children.push(child)

    return child
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

  findProvider(token: InjectionToken): Provider | null {
    this.ensureNotDestroyed()

    const provider = this.providers.get(token)
    if (provider) {
      return provider
    }

    return this.parent?.findProvider(token) ?? null
  }
}

export function createContainer(options: ContainerOptions): Container {
  return new ContainerContext(options)
}
