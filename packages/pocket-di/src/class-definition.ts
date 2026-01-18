import type { Declaration } from './declaration.ts'
import type { Injectable } from './injectable.ts'
import type { inject } from './symbols.ts'
import type { Constructor } from './utils.ts'

export interface ClassDefinition<
  T extends Injectable,
  D extends Declaration,
> extends Constructor<T> {
  [inject]?: D
}
