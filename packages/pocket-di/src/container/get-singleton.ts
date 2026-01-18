import type { Injectable } from '../injectable.ts'
import type { ParentContainer } from '../parent-container.ts'
import type { ReadonlySingletonRegistry } from '../singleton-registry.ts'
import type { Token } from '../token.ts'

export function getSingleton(input: {
  singletons: ReadonlySingletonRegistry
  parent: ParentContainer | null
  token: Token<Injectable>
}): Injectable | null {
  const { singletons, parent, token } = input

  const singleton = singletons.get(token)
  if (singleton) {
    return singleton
  }

  return parent?.singletons.get(token) ?? null
}
