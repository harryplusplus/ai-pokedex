import { onCreate, onDestroy } from './symbols.ts'
import type { MaybePromise } from './utils.ts'

export interface OnCreatable {
  [onCreate](): MaybePromise<void>
}

export interface OnDestroyable {
  [onDestroy](): MaybePromise<void>
}
