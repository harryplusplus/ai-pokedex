import type { ContainerContext } from '../container-context.ts'
import type { Providable } from './providable.ts'

export interface ContainerOptions {
  /** Array of providers or injectable constructors to register */
  providers: Providable[]
}

export interface ChildContainerOptions {
  /** Array of providers or injectable constructors to register */
  providers: Providable[]

  /** Allow overriding providers from parent container */
  override?: boolean
}

export interface ContainerContextOptions {
  providers: Providable[]
  parent?: ContainerContext | null
  override?: boolean
}
