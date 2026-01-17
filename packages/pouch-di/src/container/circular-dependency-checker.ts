import type { Any } from '../definition/common.ts'
import { type Token, tokenToString } from '../definition/token.ts'

export class CircularDependencyChecker {
  #chain = new Set<Token<Any>>()

  push(token: Token<Any>): void {
    if (this.#chain.has(token)) {
      throw new Error(
        `Circular dependency detected. ${[...this.#chain.values(), token]
          .map((x) => tokenToString(x))
          .join(' -> ')}`,
      )
    }

    this.#chain.add(token)
  }
}
