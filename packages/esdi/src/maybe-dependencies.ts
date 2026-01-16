import type { MaybePromise } from './utils.ts'

export type Dependencies = Record<string, object>

export class MaybeDependencies {
  #map: Map<string, MaybePromise<object>> = new Map()

  set(name: string, maybeDependency: MaybePromise<object>): void {
    if (this.#map.has(name)) {
      throw new Error(`${name} already exists.`)
    }

    this.#map.set(name, maybeDependency)
  }

  async get(): Promise<Dependencies> {
    const dependencies = await Promise.all(
      this.#map.entries().map(async ([name, maybeDependency]) => {
        return [name, await maybeDependency] as const
      }),
    )

    return Object.fromEntries(dependencies)
  }

  getSync(): Dependencies {
    const dependencies = this.#map.entries().map(([name, maybeDependency]) => {
      if (maybeDependency instanceof Promise) {
        throw new Error('Promise is not allowed.')
      }

      return [name, maybeDependency] as const
    })

    return Object.fromEntries(dependencies)
  }
}
