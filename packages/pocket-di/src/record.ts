import type { Any } from './utils.ts'

export type RecordType = Record<string, Any>

export class RecordBuilder {
  #record: RecordType | null = Object.create(null) as RecordType

  set(name: string, value: Any) {
    if (
      typeof name !== 'string' ||
      !name ||
      name === '__proto__' ||
      name === 'constructor' ||
      name === 'prototype'
    ) {
      throw new Error(`Invalid record property name: ${name}`)
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.#getRecord()[name] = value
  }

  build(): RecordType {
    const record = this.#getRecord()
    this.#record = null

    return record
  }

  #getRecord(): RecordType {
    if (this.#record === null) {
      throw new Error('Record is null.')
    }

    return this.#record
  }
}
