import type { Declaration } from './declaration.ts'
import type { Injectable } from './injectable.ts'
import type { ProviderLike } from './provider.ts'
import type { inject, postConstruct, preDestroy } from './symbols.ts'
import type { Any, Constructor, MaybePromise } from './utils.ts'

//#region ClassDefinition

export interface ClassDefinition<
  T extends Injectable,
  D extends Declaration,
> extends Constructor<T> {
  [inject]?: D
}

export function isClassDefinition(
  providerLike: ProviderLike<Any, Declaration>,
): providerLike is ClassDefinition<Any, Declaration> {
  return typeof providerLike === 'function'
}

//#endregion ClassDefinition

//#region Lifecycle callbacks

export interface PostConstructable {
  [postConstruct](): MaybePromise<void>
}

export interface PreDestroyable {
  [preDestroy](): MaybePromise<void>
}

//#endregion Lifecycle callbacks
