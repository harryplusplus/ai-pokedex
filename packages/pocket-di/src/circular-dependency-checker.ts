import type { Injectable } from './injectable.ts'
import { type Token, tokenToString } from './token.ts'

export class CircularDependencyChecker {
  #chain = new Set<Token<Injectable>>()

  push(token: Token<Injectable>): void {
    if (this.#chain.has(token)) {
      throw new Error(
        `Circular dependency detected. "${[...this.#chain.values(), token]
          .map((x) => tokenToString(x))
          .join(' -> ')}"`,
      )
    }

    this.#chain.add(token)
  }
}
