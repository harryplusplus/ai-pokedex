import type { ContainerContext } from './container-context.ts'
import type { Declaration } from './declaration.ts'
import type { Injectable } from './injectable.ts'
import type { Provider } from './provider.ts'
import type { Token } from './token.ts'
import type { Any } from './utils.ts'

export class ParentContext {
  readonly #context: ContainerContext

  constructor(context: ContainerContext) {
    this.#context = context
  }

  getSingleton(token: Token<Any>): Injectable | null {
    return this.#context.getSingleton(token)
  }

  getProvider(token: Token<Any>): Provider<Injectable, Declaration> | null {
    return this.#context.getProvider(token)
  }
}
