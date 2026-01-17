import { isClassDefinition } from './class-definition.ts'
import type { Providers } from './container-context.ts'
import type { Declaration } from './declaration.ts'
import { isProvider, type Provider, type ProviderLike } from './provider.ts'
import { type Token, tokenToString } from './token.ts'
import type { Any } from './utils.ts'

export class Registerer {
  #providers: Providers

  constructor(providers: Providers) {
    this.#providers = providers
  }

  register(token: Token<Any>, providerLike: ProviderLike<Any, Any>): void {
    if (this.#providers.has(token)) {
      throw new Error(`${tokenToString(token)} already registered.`)
    }

    const provider = toProvider(providerLike)

    this.#providers.set(token, provider)
  }
}

//#region Internals

function toProvider(
  providerLike: ProviderLike<Any, Declaration>,
): Provider<Any, Declaration> {
  if (isProvider(providerLike)) {
    return providerLike
  }

  if (isClassDefinition(providerLike)) {
    return {
      useClass: providerLike,
    }
  }

  const _: never = providerLike
  throw new Error('Unexpected provider like.')
}

//#endregion Internals
