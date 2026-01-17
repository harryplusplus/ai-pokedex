import type { Any, Injectable, MaybePromise } from '../definition/common.ts'
import type { InstanceContext } from '../definition/declaration.ts'
import { type Token, tokenToString } from '../definition/token.ts'

export class InstanceContextResolver {
  readonly #map: Map<string, MaybePromise<Injectable>> = new Map()
  readonly #target: Token<Any>

  constructor(target: Token<Any>) {
    this.#target = target
  }

  set(name: string, itemPromise: MaybePromise<Injectable>): void {
    if (this.#map.has(name)) {
      throw new Error(`${name} already exists.`)
    }

    this.#map.set(name, itemPromise)
  }

  async resolve(): Promise<InstanceContext> {
    const items = await Promise.all(
      this.#map.entries().map(async ([name, itemPromise]) => {
        return [name, await itemPromise] as const
      }),
    )

    return Object.fromEntries(items)
  }

  resolveSync(): InstanceContext {
    const items = this.#map.entries().map(([name, itemPromise]) => {
      if (itemPromise instanceof Promise) {
        throw new Error(
          `Dependency ${name} of ${tokenToString(this.#target)} in \`resolveSync()\` returned \`Promise\`.`,
        )
      }

      return [name, itemPromise] as const
    })

    return Object.fromEntries(items)
  }
}
