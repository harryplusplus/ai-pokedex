import { type InjectionToken, tokenToString } from './token.ts'
import type { Any } from './types.ts'

export class CircularDependencyChecker {
  #chain = new Set<InjectionToken<Any>>()

  push(token: InjectionToken<Any>): void {
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
