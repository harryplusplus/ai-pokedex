import type { Any } from '../definition/common.ts'
import { type Definition, definitionToToken } from '../definition/definition.ts'
import {
  isClassToken,
  isIndirectToken,
  tokenToString,
} from '../definition/token.ts'
import type { ContainerContext } from './container.ts'

export class Provider {
  readonly #context: ContainerContext

  constructor(context: ContainerContext) {
    this.#context = context
  }

  provide(definition: Definition<Any, Any>) {
    const token = definitionToToken(definition)

    if (this.#context.definitions.has(token)) {
      throw new Error(`${tokenToString(token)} already provided.`)
    }

    if (isClassToken(token)) {
      this.#context.definitions.set(token, token)
    } else if (isIndirectToken(token)) {
      this.#context.definitions.set(token, definition)
    } else {
      throw new Error(`${tokenToString(token)} is an invalid token.`)
    }
  }
}
