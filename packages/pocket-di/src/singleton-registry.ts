import type { Injectable } from './injectable.ts'
import type { Token } from './token.ts'

export type SingletonRegistry = Map<Token<Injectable>, Injectable>

export type ReadonlySingletonRegistry = Pick<SingletonRegistry, 'get' | 'has'>
