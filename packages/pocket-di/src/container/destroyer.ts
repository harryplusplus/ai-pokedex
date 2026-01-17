import type {
  ClassDefinition,
  OnDestroyable,
} from '../definition/class-definition.ts'
import type { Any, Injectable } from '../definition/common.ts'
import {
  isClassDefinition,
  isFactoryDefinition,
} from '../definition/definition.ts'
import type { FactoryDefinition } from '../definition/factory-definition.ts'
import { onDestroy } from '../definition/symbol.ts'
import { tokenToString } from '../definition/token.ts'
import { type ContainerContext } from './container.ts'
import type { FilledOptions } from './options.ts'

export class Destroyer {
  readonly #context: ContainerContext
  readonly #options: FilledOptions

  constructor(context: ContainerContext, options: FilledOptions) {
    this.#context = context
    this.#options = options
  }

  async destroy(): Promise<void> {
    const singletons = this.#context.singletons.entries().toArray()
    this.#context.singletons.clear()

    singletons.reverse()

    for (const [token, singleton] of singletons) {
      const definition = this.#context.definitions.get(token)
      if (!definition) {
        throw new Error(`${tokenToString(token)} definition does not exist.`)
      }

      if (isClassDefinition(definition)) {
        await this.#destroyClassInstance(singleton, definition)
      } else if (isFactoryDefinition(definition)) {
        await this.#destroyFactoryInstance(singleton, definition)
      } else {
        throw new Error(`${tokenToString(token)} is an invalid definition.`)
      }
    }

    this.#context.definitions.clear()
  }

  async #destroyClassInstance(
    instance: Injectable,
    definition: ClassDefinition<Any, Any>,
  ): Promise<void> {
    if (onDestroy in instance) {
      const onDestroyable = instance as OnDestroyable

      try {
        await onDestroyable[onDestroy]()
      } catch (e) {
        this.#options.logger.error(`Failed to destroy ${definition.name}.`, e)
      }
    }
  }

  async #destroyFactoryInstance(
    instance: Injectable,
    definition: FactoryDefinition<Any, Any>,
  ): Promise<void> {
    try {
      await definition.on?.destroy?.(instance)
    } catch (e) {
      this.#options.logger.error(
        `Failed to destroy ${tokenToString(definition.token)}.`,
        e,
      )
    }
  }
}
