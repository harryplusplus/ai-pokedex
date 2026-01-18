import { describe, expect, it } from 'vitest'

import {
  isClassDefinitionProvidable,
  isClassDefinitionToken,
} from './class-definition.ts'
import { token } from './token.ts'

describe('isClassDefinitionToken', () => {
  it('should return true for class constructor', () => {
    class Service {}

    expect(isClassDefinitionToken(Service)).toBe(true)
  })

  it('should return false for string token', () => {
    expect(isClassDefinitionToken('SERVICE')).toBe(false)
  })

  it('should return false for symbol token', () => {
    const symbolToken = Symbol('SERVICE')

    expect(isClassDefinitionToken(symbolToken)).toBe(false)
  })

  it('should return false for typed token', () => {
    const typedToken = token('SERVICE')

    expect(isClassDefinitionToken(typedToken)).toBe(false)
  })
})

describe('isClassDefinitionProvidable', () => {
  it('should return true for class constructor', () => {
    class Service {}

    expect(isClassDefinitionProvidable(Service)).toBe(true)
  })

  it('should return false for provider object with useValue', () => {
    const provider = { useValue: {} }

    expect(isClassDefinitionProvidable(provider)).toBe(false)
  })

  it('should return false for provider object with useClass', () => {
    class Service {}
    const provider = { useClass: Service }

    expect(isClassDefinitionProvidable(provider)).toBe(false)
  })

  it('should return false for provider object with useFactory', () => {
    const provider = { useFactory: () => ({}) }

    expect(isClassDefinitionProvidable(provider)).toBe(false)
  })
})
