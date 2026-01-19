import type { ChildContainerOptions } from './container-options.ts'
import type { Injectable } from './injectable.ts'
import type { InjectionToken } from './token.ts'

export interface Container {
  destroy(): Promise<void>
  resolve(token: InjectionToken): Promise<Injectable>
  resolveSync(token: InjectionToken): Injectable
  createChild(options?: ChildContainerOptions): Container
}
