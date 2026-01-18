import type { Declaration } from './declaration.ts'
import type { Injectable } from './injectable.ts'
import type { ParentContainer } from './parent-container.ts'
import type { Provider } from './provider.ts'
import type { Token } from './token.ts'

export type Providers = Map<
  Token<Injectable>,
  Provider<Injectable, Declaration>
>

export type Singletons = Map<Token<Injectable>, Injectable>

export interface ContainerContext {
  readonly providers: Providers
  readonly singletons: Singletons
  parent: ParentContainer | null
}

export function getSingleton(
  context: ContainerContext,
  token: Token<Injectable>,
): Injectable | null {
  const singleton = context.singletons.get(token)
  if (singleton) {
    return singleton
  }

  return context.parent?.getSingleton(token) ?? null
}

export function getProvider(
  context: ContainerContext,
  token: Token<Injectable>,
): Provider<Injectable, Declaration> | null {
  const provider = context.providers.get(token)
  if (provider) {
    return provider
  }

  return context.parent?.getProvider(token) ?? null
}
