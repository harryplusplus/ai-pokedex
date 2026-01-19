import type { ContainerContext } from '../container-context.ts'

export interface ContainerOptionsBase {
  providers: []
}

export type ContainerOptions = ContainerOptionsBase

export type ChildContainerOptions = ContainerOptionsBase

export interface ContainerContextOptions extends ContainerOptionsBase {
  parent: ContainerContext | null
}
