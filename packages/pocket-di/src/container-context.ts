import { CircularDependencyChecker } from './circular-dependency-checker.ts'
import type { Container } from './types/container.ts'
import type {
  ChildContainerOptions,
  ContainerContextOptions,
  ContainerOptions,
} from './types/container-options.ts'
import {
  type InjectDeclaration,
  type InjectDeclarationItem,
} from './types/inject-declaration.ts'
import * as DeclarationModule from './types/inject-declaration.ts'
import type { Injectable } from './types/injectable.ts'
import { type Providable, providableToProvider } from './types/providable.ts'
import * as ProviderModule from './types/provider.ts'
import { type Provider } from './types/provider.ts'
import { inject } from './types/symbols.ts'
import { type InjectionToken, tokenToString } from './types/token.ts'
import { AsyncLock } from './utils/async-lock.ts'

export type Providers = Map<InjectionToken, Provider>

export class ContainerContext implements Container {
  lock = new AsyncLock()
  children: ContainerContext[] = []
  providers: Map<InjectionToken, Provider>
  // TODO
  // singletons: Map<InjectionToken, Injectable>
  parent: ContainerContext | null
  destroyed = false

  constructor(options: ContainerContextOptions) {
    const { providers, parent } = parse(options)

    this.providers = providers
    this.parent = parent
  }

  async destroy(): Promise<void> {
    if (this.destroyed) {
      return
    }

    await this.lock.acquire(async () => {
      if (this.destroyed) {
        return
      }

      this.destroyed = true

      for (let i = this.children.length - 1; i >= 0; i--) {
        try {
          await this.children[i].destroy()
        } catch (_e) {
          // noop
        }
      }

      this.children.length = 0

      // TODO: destroy singletons
      // this.singletons.clear()

      this.providers.clear()
      this.parent = null
    })
  }

  resolve<I extends Injectable>(token: InjectionToken<I>): Promise<I> {
    throw new Error('Method not implemented.')
  }

  resolveSync<I extends Injectable>(token: InjectionToken<I>): I {
    throw new Error('Method not implemented.')
  }

  createChild(options?: ChildContainerOptions): Container {
    throw new Error('Method not implemented.')
  }

  ensureNotDestroyed(): void {
    if (this.destroyed) {
      throw new Error('Container is destroyed.')
    }
  }

  hasProvider(token: InjectionToken): boolean {
    this.ensureNotDestroyed()

    const provider = this.providers.get(token)
    if (provider) {
      return true
    }

    return this.parent?.hasProvider(token) ?? false
  }
}

export function createContainer(options: ContainerOptions): Container {
  return new ContainerContext(options)
}

//#region Internals

function parse(input: ContainerContextOptions): {
  providers: Providers
  parent: ContainerContext | null
} {
  const { parent = null, override = false } = input

  const providers = parseProviders({
    parent,
    override,
    inputProviders: input.providers,
  })

  const findProvider = createFindProvider({
    providers,
    parent,
  })

  for (const provider of providers.values()) {
    const checker = new CircularDependencyChecker()
    checker.push(provider.provide)

    validateDeclarationRecursive({
      provider,
      findProvider,
      checker,
    })
  }

  return {
    providers,
    parent,
  }
}

function parseProviders(input: {
  parent: ContainerContext | null
  override: boolean
  inputProviders: Providable[]
}): Providers {
  const { parent, override, inputProviders } = input

  const providers: Providers = new Map()
  for (const providable of inputProviders) {
    const provider = providableToProvider(providable)
    const token = provider.provide

    validateProvider({
      providers,
      parent,
      token,
      override,
    })

    providers.set(token, provider)
  }

  return providers
}

function validateProvider(input: {
  providers: Providers
  parent: ContainerContext | null
  token: InjectionToken
  override: boolean
}): void {
  const { providers, parent, token, override } = input

  if (parent?.hasProvider(token) && !override) {
    throw new Error(
      `Cannot register token "${tokenToString(token)}": already exists in parent container. Use override option to replace.`,
    )
  }

  if (providers.has(token)) {
    throw new Error(
      `Cannot register token "${tokenToString(token)}": duplicate registration in same container.`,
    )
  }
}

interface FindProvider {
  (token: InjectionToken): Provider | null
}

function createFindProvider(input: {
  providers: Providers
  parent: ContainerContext | null
}): FindProvider {
  const { providers, parent } = input

  return (token: InjectionToken) => findProvider({ providers, parent, token })
}

function findProvider(input: {
  providers: Providers
  parent: ContainerContext | null
  token: InjectionToken
}): Provider | null {
  const { providers, parent, token } = input

  const provider = providers.get(token)
  if (provider) {
    return provider
  }

  return parent?.providers.get(token) ?? null
}

function validateDeclarationRecursive(input: {
  provider: Provider
  findProvider: FindProvider
  checker: CircularDependencyChecker
}): void {
  const { provider, findProvider, checker } = input

  if (ProviderModule.isValue(provider)) {
    // noop

    return
  }

  if (ProviderModule.isClass(provider)) {
    validateDeclaration({
      token: provider.provide,
      declaration: provider.useClass[inject] ?? {},
      findProvider,
      className: provider.useClass.name,
      checker,
    })

    return
  }

  if (ProviderModule.isFactory(provider)) {
    validateDeclaration({
      token: provider.provide,
      declaration: provider.inject ?? {},
      findProvider,
      className: null,
      checker,
    })

    return
  }

  const _: never = provider
  throw new Error('Unexpected provider.')
}

function validateDeclaration(input: {
  token: InjectionToken
  declaration: InjectDeclaration
  findProvider: FindProvider
  checker: CircularDependencyChecker
  className: string | null
}): void {
  const { token, declaration, findProvider, checker, className } = input

  if (DeclarationModule.isTuple(declaration)) {
    for (const item of declaration) {
      validateDeclarationItem({
        item,
        findProvider,
        checker,
        token,
        className,
      })
    }

    return
  }

  if (DeclarationModule.isRecord(declaration)) {
    for (const [name, item] of Object.entries(declaration)) {
      validateDeclarationName({
        token,
        className,
        name,
      })

      validateDeclarationItem({
        item,
        findProvider,
        checker,
        token,
        className,
      })
    }

    return
  }

  const _: never = declaration
  throw new Error('Unexpected declaration.')
}

function validateDeclarationItem(input: {
  item: InjectDeclarationItem
  findProvider: FindProvider
  token: InjectionToken
  className: string | null
  checker: CircularDependencyChecker
}): void {
  const { item, findProvider, checker, token, className } = input

  const provider = findProvider(item)
  if (!provider) {
    const tokenName = tokenToString(token)
    const classInfo = className ? ` (class "${className}")` : ''
    const dependencyToken = tokenToString(item)

    throw new Error(
      `Cannot register token "${tokenName}"${classInfo}: dependency "${dependencyToken}" is not registered.`,
    )
  }

  checker.push(item)

  validateDeclarationRecursive({
    provider,
    findProvider,
    checker,
  })
}

function validateDeclarationName(input: {
  token: InjectionToken
  className: string | null
  name: string
}): void {
  const { token, className, name } = input

  if (
    !name ||
    name === '__proto__' ||
    name === 'constructor' ||
    name === 'prototype'
  ) {
    const tokenName = tokenToString(token)
    const classInfo = className ? ` (class "${className}")` : ''

    throw new Error(
      `Cannot register token "${tokenName}"${classInfo}: invalid dependency property name "${name}".`,
    )
  }
}

//#endregion Internals
