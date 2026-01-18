import type { Declaration } from '../declaration.ts'
import type { Injectable } from '../injectable.ts'
import {
  isClassDefinitionProvidable,
  isProvider,
  type Providable,
} from '../providable.ts'
import type { Provider } from '../provider.ts'
import type { ProviderRegistry } from '../provider-registry.ts'
import { isClassDefinitionToken, type Token, tokenToString } from '../token.ts'
import type { Any } from '../utils.ts'

export function register(
  context: {
    providers: ProviderRegistry
  },
  input: {
    token: Token<Injectable>
    providable?: Providable<Any, Any>
  },
): void {
  const { providers } = context
  const { token, providable } = input

  if (providers.has(token)) {
    throw new Error(`Token "${tokenToString(token)}" is already registered.`)
  }

  const provider = toProvider({
    token,
    providable,
  })

  providers.set(token, provider)
}

function toProvider(input: {
  token: Token<Injectable>
  providable?: Providable<Injectable, Declaration>
}): Provider<Injectable, Declaration> {
  const { token, providable } = input

  if (providable) {
    if (isProvider(providable)) {
      return providable
    }

    if (isClassDefinitionProvidable(providable)) {
      return {
        useClass: providable,
      }
    }

    const _: never = providable
    throw new Error('Unexpected providable.')
  }

  if (isClassDefinitionToken(token)) {
    return {
      useClass: token,
    }
  }

  const _: undefined = providable
  throw new Error('Unexpected providable.')
}
