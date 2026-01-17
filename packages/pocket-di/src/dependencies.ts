import type { ClassDefinition } from './class-definition.ts'
import type { Declaration, DeclarationItem } from './declaration.ts'
import type { inject } from './symbols.ts'
import type { Any } from './utils.ts'

export type Dependencies<D extends Declaration> = {
  [K in keyof D]: D[K] extends DeclarationItem<infer T> ? T : never
}

export type InferDependencies<T extends ClassDefinition<Any, Any>> = T extends {
  [inject]?: infer D extends Declaration
}
  ? Dependencies<D>
  : never
