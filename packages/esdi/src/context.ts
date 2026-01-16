import type { InjectionToken } from './token.ts'
import type { Any, InjectableDefinition } from './types.ts'

export class Context {
  readonly injectableDefinitions = new Map<
    InjectionToken<Any>,
    InjectableDefinition<object>
  >()

  readonly singletons = new Map<InjectionToken<Any>, object>()
}
