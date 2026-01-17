import type { Declaration } from './declaration.ts'
import type { Injectable } from './injectable.ts'
import type { ParentContext } from './parent-context.ts'
import type { Provider } from './provider.ts'
import type { RegisterOptions } from './registerer.ts'
import type { Token } from './token.ts'
import type { Any } from './utils.ts'

export interface RegistryValue {
  provider: Provider<Injectable, Declaration>
  options: Required<RegisterOptions>
}

export type Registry = Map<Token<Any>, RegistryValue>
export type Singletons = Map<Token<Any>, Injectable>

export class ContainerContext {
  readonly registry = new Map<Token<Any>, RegistryValue>()
  readonly singletons = new Map<Token<Any>, Injectable>()
  readonly #parent: ParentContext | null

  constructor(parent: ParentContext | null) {
    this.#parent = parent
  }
}
