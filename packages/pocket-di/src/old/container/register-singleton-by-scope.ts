import type { Injectable } from '../injectable.ts'
import type { Scope } from '../scope.ts'
import type { SingletonRegistry } from '../singleton-registry.ts'
import type { Token } from '../token.ts'

export function registerSingletonByScope(
  context: {
    singletons: SingletonRegistry
  },
  input: {
    token: Token<Injectable>
    instance: Injectable
    scope?: Scope
  },
) {
  const { singletons } = context
  const { token, instance, scope = 'singleton' } = input

  if (scope === 'singleton') {
    singletons.set(token, instance)
  }
}
