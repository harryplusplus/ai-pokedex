import type { ContainerContext } from '../container-context.ts'
import type { Providable } from './providable.ts'

export type ContainerOptions = Pick<ContainerContextOptions, 'providers'>

export type ChildContainerOptions = Pick<
  ContainerContextOptions,
  'providers' | 'override'
>

export interface ContainerContextOptions {
  providers: Providable[]
  parent?: ContainerContext | null
  override?: boolean
}
