import type { InjectableDefinition } from './injectable-definition.ts'
import type { InjectionToken } from './tokens.ts'
import type { Any } from './utils.ts'

export class ContainerContext {
  readonly injectableDefinitions = new Map<
    InjectionToken<Any>,
    InjectableDefinition<object>
  >()

  readonly singletons = new Map<InjectionToken<Any>, object>()
}
