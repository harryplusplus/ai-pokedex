import { createDebug } from '../shared.ts'

const debug = createDebug('waitGroup')

export interface Spawn {
  (name: string, fn: () => Promise<void>): void
}

export class WaitGroup {
  #set = new Set<Promise<void>>()

  get size(): number {
    return this.#set.size
  }

  async race(): Promise<void> {
    // NOTE: Promise.race is forever pending if there are 0 elements.
    if (this.#set.size > 0) {
      await Promise.race(this.#set)
    }
  }

  #spawn(name: string, fn: () => Promise<void>): void {
    debug(`${name} promise spawned.`)

    const promise = fn()
    this.#set.add(promise)
    promise
      .catch((e) => {
        console.error(e)
      })
      .finally(() => {
        this.#set.delete(promise)

        debug(`${name} promise deleted.`)
      })
  }

  createSpawn(): Spawn {
    return this.#spawn.bind(this)
  }
}
