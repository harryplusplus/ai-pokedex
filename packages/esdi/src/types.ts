import { inject, onClose, onCreate, type } from './symbols.ts'
import {
  type ClassToken,
  type IndirectToken,
  type InjectionToken,
} from './token.ts'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Any = any

export interface IndirectDependencyDefinition<T> {
  token: IndirectToken<T>
  [type]?: T
}

export function indirect<T extends object>(
  token: IndirectToken<T>,
): IndirectDependencyDefinition<T> {
  return {
    token,
    [type]: undefined,
  }
}

export type DependencyDefinition<T> =
  | ClassToken<T>
  | IndirectDependencyDefinition<T>

export function isClassTokenDependencyDefinition(
  definition: DependencyDefinition<Any>,
): definition is ClassToken<Any> {
  return typeof definition === 'function'
}

export function isIndirectDependencyDefinition(
  definition: DependencyDefinition<Any>,
): definition is IndirectDependencyDefinition<Any> {
  return typeof definition !== 'function' && typeof definition === 'object'
}

export function dependencyDefinitionToToken(
  definition: DependencyDefinition<Any>,
): InjectionToken<Any> {
  return isClassTokenDependencyDefinition(definition)
    ? definition
    : definition.token
}

export type DependencyDefinitions = Record<
  string,
  ClassToken<Any> | IndirectDependencyDefinition<Any>
>

export type Constructor<T> = new (...args: Any[]) => T

export interface InjectableDefinition<T> extends Constructor<T> {
  [inject]: DependencyDefinitions
}

export type Context<T extends InjectableDefinition<Any>> = T extends {
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

export interface OnCloseable {
  [onClose](): MaybePromise<void>
}
