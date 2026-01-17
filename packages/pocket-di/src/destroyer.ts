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
    const { singletons, providers } = this.#context

    const copies = singletons.entries().toArray()

    singletons.clear()

    copies.reverse()

    for (const [token, singleton] of copies) {
      const provider = providers.get(token)
      if (!provider) {
        throw new Error(`${tokenToString(token)} definition does not exist.`)
      }

      try {
        if (isFactoryProvider(provider)) {
          await provider.preDestroy?.(singleton)
        } else if (isClassProvider(provider)) {
          if (preDestroy in singleton) {
            await (singleton as PreDestroyable)[preDestroy]()
          }
        } else if (isValueProvider(provider)) {
          // noop
        } else {
          const _: never = provider
        }
      } catch (_e) {
        // noop
      }
    }

    providers.clear()
  }
}
