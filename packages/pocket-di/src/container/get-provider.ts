import type { Declaration } from '../declaration.ts'
import type { Injectable } from '../injectable.ts'
import type { ParentContainer } from '../parent-container.ts'
import type { Provider } from '../provider.ts'
import type { ReadonlyProviderRegistry } from '../provider-registry.ts'
import type { Token } from '../token.ts'

export function getProvider(input: {
  providers: ReadonlyProviderRegistry
  parent: ParentContainer | null
  token: Token<Injectable>
}): Provider<Injectable, Declaration> | null {
  const { providers, parent, token } = input

  const provider = providers.get(token)
  if (provider) {
    return provider
  }

  return parent?.providers.get(token) ?? null
}
