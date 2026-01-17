import type { Declaration } from './declaration.ts'
import type { Injectable } from './injectable.ts'
import type { ParentContainerContext } from './parent-container-context.ts'
import type { Provider } from './provider.ts'
import type { Token } from './token.ts'
import type { Any } from './utils.ts'

export type Providers = Map<Token<Any>, Provider<Any, Declaration>>
export type Singletons = Map<Token<Any>, Injectable>

export class ContainerContext {
  readonly providers = new Map<Token<Any>, Provider<Any, Declaration>>()
  readonly singletons = new Map<Token<Any>, Injectable>()
  readonly #parent: ParentContainerContext | null

  constructor(parent: ParentContainerContext | null) {
    this.#parent = parent
  }
}
