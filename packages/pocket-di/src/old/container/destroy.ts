import type { PreDestroyable } from '../lifecycle-callbacks.ts'
import type { ParentContainer } from '../parent-container.ts'
import {
  isClassProvider,
  isFactoryProvider,
  isValueProvider,
} from '../providable.ts'
import type {
  ProviderRegistry,
  ReadonlyProviderRegistry,
} from '../provider-registry.ts'
import type { SingletonRegistry } from '../singleton-registry.ts'
import { preDestroy } from '../symbols.ts'
import { tokenToString } from '../token.ts'

export async function destroy(context: {
  providers: ProviderRegistry
  singletons: SingletonRegistry
  parent: ParentContainer | null
}): Promise<void> {
  await destroySingletons(context, {
    providers: context.providers,
  })

  context.providers.clear()
  context.parent = null
}

async function destroySingletons(
  context: {
    singletons: SingletonRegistry
  },
  input: {
    providers: ReadonlyProviderRegistry
  },
): Promise<void> {
  const { singletons } = context
  const { providers } = input

  const copiedSingletons = [...singletons.entries()]

  singletons.clear()

  copiedSingletons.reverse()

  for (const [token, singleton] of copiedSingletons) {
    const provider = providers.get(token)
    if (!provider) {
      throw new Error(`Token "${tokenToString(token)}" not found.`)
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
