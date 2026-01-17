import type { Injectable } from './injectable.ts'
import type { InjectionCtx } from './injection-ctx.ts'
import type { InjectionDecl } from './injection-decl.ts'
import type { PrimitiveToken } from './tokens.ts'
import type { MaybePromise } from './utils.ts'

export interface InjectableFactoryDef<
  T extends Injectable,
  D extends InjectionDecl,
> {
  token: PrimitiveToken
  inject?: D
  fn: (c: InjectionCtx<D>) => MaybePromise<T>
  on?: {
    destroy?: (self: T) => MaybePromise<void>
  }
}

export interface InjectableFactoryDefFn<T extends Injectable> {
  <D extends InjectionDecl>(
    def: InjectableFactoryDef<T, D>,
  ): InjectableFactoryDef<T, D>
}

function define<T extends Injectable, D extends InjectionDecl>(
  def: InjectableFactoryDef<T, D>,
): InjectableFactoryDef<T, D>

function define<T extends Injectable>(): InjectableFactoryDefFn<T>

function define<T extends Injectable, D extends InjectionDecl>(
  def?: InjectableFactoryDef<T, D>,
): InjectableFactoryDef<T, D> | InjectableFactoryDefFn<T> {
  if (def) {
    return def
  }

  return (def) => define(def)
}

export { define }
