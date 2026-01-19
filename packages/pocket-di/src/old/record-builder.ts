import type { Any } from './utils.ts'

export type AnyRecord = Record<string, Any>

export class RecordBuilder {
  #value: AnyRecord | null = Object.create(null) as AnyRecord

  get #record(): AnyRecord {
    if (this.#value === null) {
      throw new Error('Cannot access record after build.')
    }

    return this.#value
  }

  set #record(value: AnyRecord | null) {
    this.#value = value
  }

  set(name: string, value: Any): void {
    if (
      typeof name !== 'string' ||
      !name ||
      name === '__proto__' ||
      name === 'constructor' ||
      name === 'prototype'
    ) {
      throw new Error(`Invalid property name "${name}".`)
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.#record[name] = value
  }

  build(): AnyRecord {
    const record = this.#record
    this.#record = null

    return record
  }
}
