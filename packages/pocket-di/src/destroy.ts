import { isClassProvider } from './class-provider.ts'
import type {
  ContainerContext,
  Providers,
  Singletons,
} from './container-context.ts'
import { isFactoryProvider } from './factory-provider.ts'
import type { PreDestroyable } from './lifecycle-callbacks.ts'
import { preDestroy } from './symbols.ts'
import { tokenToString } from './token.ts'
import { isValueProvider } from './value-provider.ts'

export async function destroy(context: ContainerContext): Promise<void> {
  await destroySingletons({
    providers: context.providers,
    singletons: context.singletons,
  })

  context.providers.clear()
  context.parent = null
}

async function destroySingletons(input: {
  providers: Providers
  singletons: Singletons
}): Promise<void> {
  const { providers, singletons } = input

  const copiedSingletons = [...singletons.entries()]

  singletons.clear()

  copiedSingletons.reverse()

  for (const [token, singleton] of copiedSingletons) {
    const provider = providers.get(token)
    if (!provider) {
      throw new Error(`"${tokenToString(token)}" not registered.`)
    }

    if (isClassProvider(provider)) {
      if (preDestroy in singleton) {
        try {
          await (singleton as PreDestroyable)[preDestroy]()
        } catch (_e) {
          // noop
        }
      }

      continue
    }

    if (isFactoryProvider(provider)) {
      try {
        await provider.preDestroy?.(singleton)
      } catch (_e) {
        // noop
      }

      continue
    }

    if (isValueProvider(provider)) {
      // noop

      continue
    }

    const _: never = provider
    throw new Error('Unexpected provider.')
  }
}
