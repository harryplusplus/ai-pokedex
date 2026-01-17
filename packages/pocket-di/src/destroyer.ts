import type { PreDestroyable } from './class-definition.ts'
import { isClassProvider } from './class-provider.ts'
import type { Providers, Singletons } from './container-context.ts'
import { isFactoryProvider } from './factory-provider.ts'
import { preDestroy } from './symbols.ts'
import { tokenToString } from './token.ts'
import { isValueProvider } from './value-provider.ts'

export class Destroyer {
  readonly #providers: Providers
  readonly #singletons: Singletons

  constructor(providers: Providers, singletons: Singletons) {
    this.#providers = providers
    this.#singletons = singletons
  }

  async destroy(): Promise<void> {
    const copies = this.#singletons.entries().toArray()

    this.#singletons.clear()

    copies.reverse()

    for (const [token, singleton] of copies) {
      const provider = this.#providers.get(token)
      if (!provider) {
        throw new Error(`"${tokenToString(token)}" provider does not exist.`)
      }

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

    this.#providers.clear()
  }
}
