import type { Any, Injectable, MaybePromise } from '../definition/common.ts'
import type { Dependencies } from '../definition/declaration.ts'
import { type Token, tokenToString } from '../definition/token.ts'

export class DependenciesResolver {
  readonly #map: Map<string, MaybePromise<Injectable>> = new Map()
  readonly #target: Token<Any>

  constructor(target: Token<Any>) {
    this.#target = target
  }

  set(name: string, dependencyPromise: MaybePromise<Injectable>): void {
    if (this.#map.has(name)) {
      throw new Error(`${name} already exists.`)
    }

    this.#map.set(name, dependencyPromise)
  }

  async resolve(): Promise<Dependencies<Any>> {
    const items = await Promise.all(
      this.#map.entries().map(async ([name, dependencyPromise]) => {
        return [name, await dependencyPromise] as const
      }),
    )

    return Object.fromEntries(items)
  }

  resolveSync(): Dependencies<Any> {
    const items = this.#map.entries().map(([name, dependencyPromise]) => {
      if (dependencyPromise instanceof Promise) {
        throw new Error(
          `Dependency ${name} of ${tokenToString(this.#target)} in \`resolveSync()\` returned \`Promise\`.`,
        )
      }

      return [name, dependencyPromise] as const
    })

    return Object.fromEntries(items)
  }
}
