import type { Container } from './types/container.ts'
import type {
  ChildContainerOptions,
  ContainerContextOptions,
  ContainerOptions,
} from './types/container-options.ts'
import type { Injectable } from './types/injectable.ts'
import type { InjectionToken } from './types/token.ts'

export class ContainerContext implements Container {
  parent: ContainerContext | null

  constructor(options: ContainerContextOptions) {
    this.parent = options.parent
  }

  destroy(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  resolve(token: InjectionToken): Promise<Injectable> {
    throw new Error('Method not implemented.')
  }

  resolveSync(token: InjectionToken): Injectable {
    throw new Error('Method not implemented.')
  }

  createChild(options?: ChildContainerOptions): Container {
    throw new Error('Method not implemented.')
  }
}

export function createContainer(options: ContainerOptions): Container {
  return new ContainerContext({
    parent: null,
    ...options,
  })
}
