import type { PreDestroyable } from './class-definition.ts'
import { isClassProvider } from './class-provider.ts'
import type { ContainerContext } from './container-context.ts'
import { isFactoryProvider } from './factory-provider.ts'
import { preDestroy } from './symbols.ts'
import { tokenToString } from './token.ts'
import { isValueProvider } from './value-provider.ts'

export class Destroyer {
  readonly #context: ContainerContext

  constructor(context: ContainerContext) {
    this.#context = context
  }

  async destroy(): Promise<void> {
    const { singletons, registry } = this.#context

    const copies = singletons.entries().toArray()

    singletons.clear()

    copies.reverse()

    for (const [token, singleton] of copies) {
      const registryValue = registry.get(token)
      if (!registryValue) {
        throw new Error(`${tokenToString(token)} definition does not exist.`)
      }

      const { provider } = registryValue

      try {
        if (isClassProvider(provider)) {
          if (preDestroy in singleton) {
            await (singleton as PreDestroyable)[preDestroy]()
          }

          continue
        }

        if (isFactoryProvider(provider)) {
          await provider.preDestroy?.(singleton)

          continue
        }

        if (isValueProvider(provider)) {
          // noop

          continue
        }

        const _: never = provider
        throw new Error('Unexpected provider.')
      } catch (_e) {
        // noop
      }
    }

    registry.clear()
  }
}
