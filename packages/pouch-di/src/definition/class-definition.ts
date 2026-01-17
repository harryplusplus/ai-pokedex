import type { Constructor, Injectable, MaybePromise } from './common.ts'
import type { Declaration } from './declaration.ts'
import type { inject, onCreate, onDestroy } from './symbol.ts'

//#region ClassDefinition

export interface ClassDefinition<
  T extends Injectable,
  D extends Declaration,
> extends Constructor<T> {
  [inject]?: D
}

//#endregion ClassDefinition

//#region Hooks

export interface OnCreatable {
  [onCreate](): MaybePromise<void>
}

export interface OnDestroyable {
  [onDestroy](): MaybePromise<void>
}

//#endregion Hooks
