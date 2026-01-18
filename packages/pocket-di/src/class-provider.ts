import type { ClassDefinition } from './class-definition.ts'
import type { Declaration } from './declaration.ts'
import type { Injectable } from './injectable.ts'
import type { Providable } from './providable.ts'
import type { Scope } from './scope.ts'

export interface ClassProvider<T extends Injectable, D extends Declaration> {
  useClass: ClassDefinition<T, D>
  scope?: Scope
}

export function isClassProvider(
  providable: Providable<Injectable, Declaration>,
): providable is ClassProvider<Injectable, Declaration> {
  return 'useClass' in providable
}
