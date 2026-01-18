import type { postConstruct, preDestroy } from './symbols.ts'
import type { MaybePromise } from './utils.ts'

export interface PostConstructable {
  [postConstruct](): MaybePromise<void>
}

export interface PreDestroyable {
  [preDestroy](): MaybePromise<void>
}
