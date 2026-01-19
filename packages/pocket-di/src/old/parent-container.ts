import type { ReadonlyProviderRegistry } from './provider-registry.ts'
import type { ReadonlySingletonRegistry } from './singleton-registry.ts'

export interface ParentContainer {
  singletons: ReadonlySingletonRegistry
  providers: ReadonlyProviderRegistry
}
