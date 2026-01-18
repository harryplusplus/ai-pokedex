import {
  type ContainerContext,
  getProvider,
  getSingleton,
} from './container-context.ts'
import type { Declaration } from './declaration.ts'
import type { Injectable } from './injectable.ts'
import type { Provider } from './provider.ts'
import type { Token } from './token.ts'

export class ParentContainer {
  #context: ContainerContext

  constructor(context: ContainerContext) {
    this.#context = context
  }

  getSingleton(token: Token<Injectable>): Injectable | null {
    return getSingleton(this.#context, token)
  }

  getProvider(
    token: Token<Injectable>,
  ): Provider<Injectable, Declaration> | null {
    return getProvider(this.#context, token)
  }
}
