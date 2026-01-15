import { inject, onCreate, onDestroy, type } from './symbols.ts'
import { type ClassToken, type IndirectToken } from './token.ts'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Any = any

export interface IndirectDependency<T> {
  token: IndirectToken<T>
  [type]?: T
}

export function indirect<T extends object>(
  token: IndirectToken<T>,
): IndirectDependency<T> {
  return {
    token,
    [type]: undefined,
  }
}

export type Dependency<T> = ClassToken<T> | IndirectDependency<T>

export function isClassTokenDependency(
  dependency: Dependency<Any>,
): dependency is ClassToken<Any> {
  return typeof dependency === 'function'
}

export function isIndirectDependency(
  dependency: Dependency<Any>,
): dependency is IndirectDependency<Any> {
  return typeof dependency !== 'function' && typeof dependency === 'object'
}

export type Dependencies = Record<
  string,
  ClassToken<Any> | IndirectDependency<Any>
>

export type Constructor<T> = new (...args: Any[]) => T

export interface Injectable<T> extends Constructor<T> {
  [inject]: Dependencies
}

export type Context<T extends Injectable<Any>> = T extends {
  [inject]: infer I
}
  ? {
      [K in keyof I]: I[K] extends { [type]?: infer T }
        ? T
        : I[K] extends abstract new (...args: Any[]) => infer T
          ? T
          : never
    }
  : never

export type MaybePromise<T> = T | Promise<T>

export interface OnCreatable {
  [onCreate](): MaybePromise<void>
}

export interface OnDestroyable {
  [onDestroy](): MaybePromise<void>
}
