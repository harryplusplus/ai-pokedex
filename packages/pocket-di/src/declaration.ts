import type { ClassDefinition } from './class-definition.ts'
import type { Injectable } from './injectable.ts'
import type { TypedToken } from './token.ts'

export type DeclarationItem<T extends Injectable> =
  | ClassDefinition<T, Declaration>
  | TypedToken<T>

export type Declaration = Record<string, DeclarationItem<Injectable>>
