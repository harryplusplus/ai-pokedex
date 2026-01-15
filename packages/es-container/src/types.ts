import { inject, onCreate, onDestroy, type } from './symbols.ts'
import {
  type ClassToken,
  type InjectionToken,
  isClassToken,
  isIndirectToken,
} from './token.ts'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Any = any

export interface DependencyDefinition<T> {
  kind: 'class' | 'indirect'
  token: InjectionToken<Any>
  [type]?: T
}

export function dependency<T extends object>(
  token: InjectionToken<Any>,
): DependencyDefinition<T> {
  if (isClassToken(token)) {
    return {
      kind: 'class',
      token,
      [type]: undefined,
    }
  } else if (isIndirectToken(token)) {
    return {
      kind: 'indirect',
      token,
      [type]: undefined,
    }
  } else {
    throw new Error()
  }
}

export type Dependency<T> = ClassToken<T> | DependencyDefinition<T>

export function isClassTokenDependency(
  dependency: Dependency<Any>,
): dependency is ClassToken<Any> {
  return typeof dependency === 'function'
}

export function isDependencyDefinition(
  dependency: Dependency<Any>,
): dependency is DependencyDefinition<Any> {
  return typeof dependency !== 'function' && typeof dependency === 'object'
}

export type DependencyDefinitions = Record<
  string,
  ClassToken<Any> | DependencyDefinition<Any>
>

export type Constructor<T> = abstract new (...args: Any[]) => T

export interface Injectable<T> extends Constructor<T> {
  [inject]: DependencyDefinitions
}

export type Injected<T extends Injectable<Any>> = T extends {
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

export interface OnCreatable {
  [onCreate](): void
}

export interface OnDestroyable {
  [onDestroy](): void
}
