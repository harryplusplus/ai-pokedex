import type { ParentContainer } from './parent-container.ts'
import type { ProviderRegistry } from './provider-registry.ts'
import type { SingletonRegistry } from './singleton-registry.ts'

export interface ContainerContext1 extends ParentContainer {
  readonly providers: ProviderRegistry
  readonly singletons: SingletonRegistry
  parent: ParentContainer | null
}

export class ContainerContext {}
