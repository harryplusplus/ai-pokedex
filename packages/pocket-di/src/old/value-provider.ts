import type { Injectable } from './injectable.ts'

export interface ValueProvider<T extends Injectable> {
  useValue: T
}
