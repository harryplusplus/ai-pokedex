import type { ClassDefinition } from './class-definition.ts'
import type { Declaration } from './declaration.ts'
import type { Injectable } from './injectable.ts'
import type { Provider } from './provider.ts'

export type Providable<T extends Injectable, D extends Declaration> =
  | Provider<T, D>
  | ClassDefinition<T, D>
