import type { Declaration } from './declaration.ts'
import type { Injectable } from './injectable.ts'
import type { Provider } from './provider.ts'
import type { Token } from './token.ts'

export type ProviderRegistry = Map<
  Token<Injectable>,
  Provider<Injectable, Declaration>
>

export type ReadonlyProviderRegistry = Pick<ProviderRegistry, 'get' | 'has'>
