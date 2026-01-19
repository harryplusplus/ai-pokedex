import { describe, expect, it } from 'vitest'

import { isClassProvider } from './class-provider.ts'

describe('isClassProvider', () => {
  it('should return true for provider with useClass', () => {
    class Service {}
    const provider = { useClass: Service }

    expect(isClassProvider(provider)).toBe(true)
  })

  it('should return true for provider with useClass and scope', () => {
    class Service {}
    const provider = { useClass: Service, scope: 'singleton' as const }

    expect(isClassProvider(provider)).toBe(true)
  })

  it('should return false for provider with useValue', () => {
    const provider = { useValue: {} }

    expect(isClassProvider(provider)).toBe(false)
  })

  it('should return false for provider with useFactory', () => {
    const provider = { useFactory: () => ({}) }

    expect(isClassProvider(provider)).toBe(false)
  })

  it('should return false for class constructor directly', () => {
    class Service {}

    expect(isClassProvider(Service)).toBe(false)
  })
})
