import { isClassDefinition } from './class-definition.ts'
import type { Providers } from './container-context.ts'
import type { Declaration } from './declaration.ts'
import { isProvider, type Provider, type ProviderLike } from './provider.ts'
import { isClassToken, type Token, tokenToString } from './token.ts'
import type { Any } from './utils.ts'

export class Registerer {
  #providers: Providers

  constructor(providers: Providers) {
    this.#providers = providers
  }

  register(token: Token<Any>, providerLike?: ProviderLike<Any, Any>): void {
    if (this.#providers.has(token)) {
      throw new Error(`"${tokenToString(token)}" already registered.`)
    }

    const provider = toProvider(token, providerLike)

    this.#providers.set(token, provider)
  }
}

//#region Internals

function toProvider(
  token: Token<Any>,
  providerLike?: ProviderLike<Any, Declaration>,
): Provider<Any, Declaration> {
  if (providerLike) {
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
  } else {
    if (isClassToken(token)) {
      return {
        useClass: token,
      }
    } else {
      const _: undefined = providerLike
      throw new Error('Unexpected provider like.')
    }
  }
}

//#endregion Internals
