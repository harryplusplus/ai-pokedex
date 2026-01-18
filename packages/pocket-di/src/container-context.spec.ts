import { describe, expect, it } from 'vitest'

import type { ContainerContext } from './container-context.ts'
import { getProvider, getSingleton } from './container-context.ts'
import { ParentContainer } from './parent-container.ts'
import { token } from './token.ts'

describe('getSingleton', () => {
  it('should return singleton from context', () => {
    const tokenA = token('A')
    const instance = {}

    const context: ContainerContext = {
      providers: new Map(),
      singletons: new Map([[tokenA, instance]]),
      parent: null,
    }

    expect(getSingleton(context, tokenA)).toBe(instance)
  })

  it('should return null when singleton not found', () => {
    const tokenA = token('A')

    const context: ContainerContext = {
      providers: new Map(),
      singletons: new Map(),
      parent: null,
    }

    expect(getSingleton(context, tokenA)).toBeNull()
  })

  it('should return singleton from parent', () => {
    const tokenA = token('A')
    const instance = {}

    const parentContext: ContainerContext = {
      providers: new Map(),
      singletons: new Map([[tokenA, instance]]),
      parent: null,
    }

    const parent = new ParentContainer(parentContext)

    const context: ContainerContext = {
      providers: new Map(),
      singletons: new Map(),
      parent,
    }

    expect(getSingleton(context, tokenA)).toBe(instance)
  })

  it('should prioritize context singleton over parent', () => {
    const tokenA = token('A')
    const contextInstance = {}
    const parentInstance = {}

    const parentContext: ContainerContext = {
      providers: new Map(),
      singletons: new Map([[tokenA, parentInstance]]),
      parent: null,
    }

    const parent = new ParentContainer(parentContext)

    const context: ContainerContext = {
      providers: new Map(),
      singletons: new Map([[tokenA, contextInstance]]),
      parent,
    }

    expect(getSingleton(context, tokenA)).toBe(contextInstance)
  })
})

describe('getProvider', () => {
  it('should return provider from context', () => {
    const tokenA = token('A')
    const provider = { useValue: {} }

    const context: ContainerContext = {
      providers: new Map([[tokenA, provider]]),
      singletons: new Map(),
      parent: null,
    }

    expect(getProvider(context, tokenA)).toBe(provider)
  })

  it('should return null when provider not found', () => {
    const tokenA = token('A')

    const context: ContainerContext = {
      providers: new Map(),
      singletons: new Map(),
      parent: null,
    }

    expect(getProvider(context, tokenA)).toBeNull()
  })

  it('should return provider from parent', () => {
    const tokenA = token('A')
    const provider = { useValue: {} }

    const parentContext: ContainerContext = {
      providers: new Map([[tokenA, provider]]),
      singletons: new Map(),
      parent: null,
    }

    const parent = new ParentContainer(parentContext)

    const context: ContainerContext = {
      providers: new Map(),
      singletons: new Map(),
      parent,
    }

    expect(getProvider(context, tokenA)).toBe(provider)
  })

  it('should prioritize context provider over parent', () => {
    const tokenA = token('A')
    const contextProvider = { useValue: {} }
    const parentProvider = { useValue: {} }

    const parentContext: ContainerContext = {
      providers: new Map([[tokenA, parentProvider]]),
      singletons: new Map(),
      parent: null,
    }

    const parent = new ParentContainer(parentContext)

    const context: ContainerContext = {
      providers: new Map([[tokenA, contextProvider]]),
      singletons: new Map(),
      parent,
    }

    expect(getProvider(context, tokenA)).toBe(contextProvider)
  })
})
