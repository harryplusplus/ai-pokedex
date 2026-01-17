import type { Any, Injectable } from '../definition/common.ts'
import type { FactoryDefinition } from '../definition/factory-definition.ts'
import {
  type DirectToken,
  type IndirectToken,
  isDirectToken,
  isIndirectToken,
  type Token,
  tokenToString,
} from '../definition/token.ts'
import type { ContainerContext } from './container.ts'

export interface ProvideFn<R> {
  <T extends Injectable>(token: DirectToken<T>): R
  <T extends Injectable>(
    token: IndirectToken<T>,
    definition: FactoryDefinition<T, Any>,
  ): R
  <T extends Injectable>(
    token: Token<T>,
    definition?: FactoryDefinition<T, Any>,
  ): R
}

export class Provider {
  readonly #context: ContainerContext

  constructor(context: ContainerContext) {
    this.#context = context
  }

  provide: ProvideFn<void> = <T extends Injectable>(
    token: Token<T>,
    definition?: FactoryDefinition<T, Any>,
  ) => {
    if (this.#context.definitions.has(token)) {
      throw new Error(`${tokenToString(token)} already provided.`)
    }

    if (isDirectToken(token)) {
      this.#provideDirectToken(token)
    } else if (isIndirectToken(token)) {
      this.#provideIndirectToken(token, definition)
    } else {
      throw new Error(`${tokenToString(token)} is an invalid token.`)
    }
  }

  #provideDirectToken(token: DirectToken<Any>): void {
    this.#context.definitions.set(token, token)
  }

  #provideIndirectToken(
    token: IndirectToken<Any>,
    definition?: FactoryDefinition<Any, Any>,
  ): void {
    if (!definition) {
      throw new Error(`${tokenToString(token)}'s definition was not provided.`)
    }

    this.#context.definitions.set(token, definition)
  }
}
