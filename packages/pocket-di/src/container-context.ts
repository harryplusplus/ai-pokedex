import type { Declaration } from './declaration.ts'
import type { Injectable } from './injectable.ts'
import type { ParentContext } from './parent-context.ts'
import type { Provider } from './provider.ts'
import type { Token } from './token.ts'
import type { Any } from './utils.ts'

export type Providers = Map<Token<Any>, Provider<Injectable, Declaration>>
export type Singletons = Map<Token<Any>, Injectable>

export class ContainerContext {
  readonly providers = new Map<Token<Any>, Provider<Injectable, Declaration>>()
  readonly singletons = new Map<Token<Any>, Injectable>()
  readonly #parent: ParentContext | null

  constructor(parent: ParentContext | null) {
    this.#parent = parent
  }

  getSingleton(token: Token<Any>): Injectable | null {
    const singleton = this.singletons.get(token)
    if (singleton) {
      return singleton
    }

    return this.#parent?.getSingleton(token) ?? null
  }

  getProvider(token: Token<Any>): Provider<Injectable, Declaration> | null {
    const provider = this.providers.get(token)
    if (provider) {
      return provider
    }

    return this.#parent?.getProvider(token) ?? null
  }
}
