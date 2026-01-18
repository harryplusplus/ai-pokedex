import {
  isClassDefinitionProvidable,
  isClassDefinitionToken,
} from './class-definition.ts'
import type { Providers } from './container-context.ts'
import type { Declaration } from './declaration.ts'
import type { Injectable } from './injectable.ts'
import type { Providable } from './providable.ts'
import { isProvider, type Provider } from './provider.ts'
import { type Token, tokenToString } from './token.ts'
import type { Any } from './utils.ts'

export function register(input: {
  providers: Providers
  token: Token<Injectable>
  providable?: Providable<Injectable, Declaration>
}): void {
  const { providers, token, providable } = input

  if (providers.has(token)) {
    throw new Error(`"${tokenToString(token)}" already registered.`)
  }

  const provider = toProvider(token, providable)

  providers.set(token, provider)
}

function toProvider(
  token: Token<Injectable>,
  providable?: Providable<Injectable, Declaration>,
): Provider<Injectable, Declaration> {
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
