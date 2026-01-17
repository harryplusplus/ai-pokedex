import type { Injectable } from './injectable.ts'
import type { InjectionDecl } from './injection-decl.ts'
import { inject } from './symbols.ts'
import type { Constructor } from './utils.ts'

export interface InjectableClassDef<
  T extends Injectable,
  D extends InjectionDecl,
> extends Constructor<T> {
  [inject]: D
}
