import { Type } from '@nestjs/common'

export class Registry {
  #metatypeSet = new Set<Type>()

  add(metatype: Type): void {
    if (this.#metatypeSet.has(metatype)) {
      throw new Error(`${metatype.name} already exists.`)
    }

    this.#metatypeSet.add(metatype)
  }

  values(): SetIterator<Type> {
    return this.#metatypeSet.values()
  }
}
