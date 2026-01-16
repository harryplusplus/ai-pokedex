import type { DependencyDefinitions } from './dependency-definitions.ts'
import type { inject, type } from './symbols.ts'
import type { Any, Constructor } from './utils.ts'

export interface InjectableDefinition<T> extends Constructor<T> {
  [inject]: DependencyDefinitions
}

export type Context<T extends InjectableDefinition<Any>> = T extends {
  [inject]: infer I
}
  ? {
      [K in keyof I]: I[K] extends { [type]?: infer T }
        ? T
        : I[K] extends abstract new (...args: Any[]) => infer T
          ? T
          : never
    }
  : never
