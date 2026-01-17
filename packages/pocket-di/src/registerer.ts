import { isClassDefinition } from './class-definition.ts'
import type { ContainerContext } from './container-context.ts'
import type { Declaration } from './declaration.ts'
import type { Lifecycle } from './lifecycle.ts'
import { isProvider, type Provider, type ProviderLike } from './provider.ts'
import { type Token, tokenToString } from './token.ts'
import type { Any } from './utils.ts'

export interface RegisterOptions {
  lifecycle?: Lifecycle
}

export class Registerer {
  #context: ContainerContext

  constructor(context: ContainerContext) {
    this.#context = context
  }

  register(
    token: Token<Any>,
    providerLike: ProviderLike<Any, Any>,
    options?: RegisterOptions,
  ): void {
    const { registry } = this.#context

    if (registry.has(token)) {
      throw new Error(`${tokenToString(token)} already registered.`)
    }

    const provider = toProvider(providerLike)

    registry.set(token, {
      provider,
      options: {
        lifecycle: 'singleton',
        ...options,
      },
    })
  }
}

//#region Internals

function toProvider(
  providerLike: ProviderLike<Any, Declaration>,
): Provider<Any, Declaration> {
  if (isProvider(providerLike)) {
    return providerLike
  } else if (isClassDefinition(providerLike)) {
    return {
      useClass: providerLike,
    }
  } else {
    const _: never = providerLike
    throw new Error('Unexpected provider like.')
  }
}

//#endregion Internals
