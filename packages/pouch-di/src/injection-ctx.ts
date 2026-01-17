import { type InjectionDecl, type InjectionDeclItem } from './injection-decl.ts'

export type InjectionCtx<D extends InjectionDecl> = {
  [K in keyof D]: D[K] extends InjectionDeclItem<infer T> ? T : never
}
