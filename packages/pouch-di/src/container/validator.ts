import type { Any } from '../definition/common.ts'
import {
  type Declaration,
  isClassDeclarationItem,
  isIndirectDeclarationItem,
} from '../definition/declaration.ts'
import { definitionToDeclaration } from '../definition/definition.ts'
import { isClassToken, type Token, tokenToString } from '../definition/token.ts'
import type { ContainerContext } from './container.ts'

export class Validator {
  readonly #context: ContainerContext

  constructor(context: ContainerContext) {
    this.#context = context
  }

  validate(target: Token<Any>): void {
    let definition = this.#context.definitions.get(target)
    if (!definition) {
      if (isClassToken(target)) {
        definition = target
      } else {
        throw new Error(`${tokenToString(target)} was not provided.`)
      }
    }

    const declaration = definitionToDeclaration(definition)
    this.#validateDeclaration(target, declaration)
  }

  #validateDeclaration(target: Token<Any>, declaration: Declaration): void {
    for (const [name, item] of Object.entries(declaration)) {
      if (isClassDeclarationItem(item)) {
        this.validate(item)
      } else if (isIndirectDeclarationItem(item)) {
        if (!this.#context.definitions.has(item)) {
          throw new Error(
            `${tokenToString(target)}'s dependency ${name} (token: ${tokenToString(item)}) was not provided.`,
          )
        }

        this.validate(item)
      } else {
        throw new Error(`${name} is an invalid declaration item.`)
      }
    }
  }
}
