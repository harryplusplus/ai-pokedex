export function toErrorString(e: unknown): string {
  if (e instanceof Error) {
    return e.message
  }

  if (typeof e === 'object' && e && 'message' in e) {
    return String(e.message)
  }

  return JSON.stringify(e)
}

export interface Spawn {
  (fn: () => Promise<void>): void
}

export class WaitGroup {
  #set = new Set<Promise<void>>()

  get size(): number {
    return this.#set.size
  }

  // NOTE: Promise.race is forever pending if there are 0 elements.
  async race(): Promise<void> {
    if (this.#set.size > 0) {
      await Promise.race(this.#set)
    }
  }

  spawn(fn: () => Promise<void>): void {
    const promise = fn()
    this.#set.add(promise)
    promise
      .catch((e) => {
        console.error(e)
      })
      .finally(() => this.#set.delete(promise))
  }
}
