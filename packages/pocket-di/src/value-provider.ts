import type { Declaration } from './declaration.ts'
import type { Injectable } from './injectable.ts'
import type { Providable } from './providable.ts'

export interface ValueProvider<T extends Injectable> {
  useValue: T
}

export function isValueProvider(
  providable: Providable<Injectable, Declaration>,
): providable is ValueProvider<Injectable> {
  return 'useValue' in providable
}
