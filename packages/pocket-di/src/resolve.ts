import { CircularDependencyChecker } from './circular-dependency-checker.ts'
import { type ClassProvider, isClassProvider } from './class-provider.ts'
import {
  type ContainerContext,
  getProvider,
  getSingleton,
  type Singletons,
} from './container-context.ts'
import type { Declaration } from './declaration.ts'
import type { Dependencies } from './dependencies.ts'
import { type FactoryProvider, isFactoryProvider } from './factory-provider.ts'
import type { Injectable } from './injectable.ts'
import type { PostConstructable } from './lifecycle-callbacks.ts'
import { RecordBuilder } from './record-builder.ts'
import type { Scope } from './scope.ts'
import { inject, postConstruct } from './symbols.ts'
import { type Token, tokenToString } from './token.ts'
import type { MaybePromise } from './utils.ts'
import { isValueProvider } from './value-provider.ts'

export async function resolve<T extends Injectable>(input: {
  context: ContainerContext
  token: Token<T>
}): Promise<T> {
  const { context, token } = input

  const checker = new CircularDependencyChecker()
  checker.push(token)

  const instance = await resolveRecursive({
    context,
    token,
    checker,
    resolveDependencies: resolveDependenciesAsync,
  })

  return instance as T
}

export function resolveSync<T extends Injectable>(input: {
  context: ContainerContext
  token: Token<T>
}): T {
  const { context, token } = input

  const checker = new CircularDependencyChecker()
  checker.push(token)

  const instance = resolveRecursive({
    context,
    token,
    checker,
    resolveDependencies: resolveDependenciesSync,
  })

  if (instance instanceof Promise) {
    throw new Error(
      `Cannot resolve "${tokenToString(token)}" synchronously: returns Promise.`,
    )
  }

  return instance as T
}

type DependentProvider =
  | ClassProvider<Injectable, Declaration>
  | FactoryProvider<Injectable, Declaration>

type DependencyMaybePromises = Record<string, MaybePromise<Injectable>>

function getDependencyMaybePromises(input: {
  context: ContainerContext
  checker: CircularDependencyChecker
  provider: DependentProvider
  resolveDependencies: ResolveDependencies
}): DependencyMaybePromises {
  const { context, checker, provider, resolveDependencies } = input

  const declaration = getDeclaration(provider)
  const builder = new RecordBuilder()

  for (const [name, item] of Object.entries(declaration)) {
    checker.push(item)

    const dependency = resolveRecursive({
      context,
      token: item,
      checker,
      resolveDependencies,
    })

    builder.set(name, dependency)
  }

  return builder.build()
}

interface ResolveDependenciesInput {
  dependencyMaybePromises: DependencyMaybePromises
  provider: DependentProvider
  singletons: Singletons
  token: Token<Injectable>
}

interface ResolveDependencies {
  (input: ResolveDependenciesInput): MaybePromise<Injectable>
}

async function resolveDependenciesAsync(
  input: ResolveDependenciesInput,
): Promise<Injectable> {
  const { dependencyMaybePromises, provider, singletons, token } = input

  const dependencies = await getDependenciesAsync(dependencyMaybePromises)

  const instance = await createInstance({
    token,
    provider,
    dependencies,
    sync: false,
  })

  registerSingletonByScope({
    singletons,
    token,
    instance,
    scope: provider.scope,
  })

  return instance
}

function resolveDependenciesSync(input: ResolveDependenciesInput): Injectable {
  const { dependencyMaybePromises, provider, singletons, token } = input

  const dependencies = getDependenciesSync({
    token,
    maybePromises: dependencyMaybePromises,
  })

  const instance = createInstance({
    token,
    provider,
    dependencies,
    sync: true,
  })

  if (instance instanceof Promise) {
    throw new Error(
      `Cannot resolve "${tokenToString(token)}" synchronously: returns Promise.`,
    )
  }

  registerSingletonByScope({
    singletons,
    token,
    instance,
    scope: provider.scope,
  })

  return instance
}

async function getDependenciesAsync(
  maybePromises: DependencyMaybePromises,
): Promise<Dependencies<Declaration>> {
  const promises = Object.entries(maybePromises).map(async ([key, value]) => {
    return [key, await value] as const
  })

  const entries = await Promise.all(promises)

  return Object.fromEntries(entries)
}

function getDependenciesSync(input: {
  token: Token<Injectable>
  maybePromises: DependencyMaybePromises
}): Dependencies<Declaration> {
  const { token, maybePromises } = input

  const entries = Object.entries(maybePromises).map(([name, maybePromise]) => {
    if (maybePromise instanceof Promise) {
      throw new Error(
        `Cannot resolve "${tokenToString(token)}" synchronously: dependency "${name}" returns Promise.`,
      )
    }

    return [name, maybePromise] as const
  })

  return Object.fromEntries(entries)
}

function resolveRecursive(input: {
  context: ContainerContext
  token: Token<Injectable>
  checker: CircularDependencyChecker
  resolveDependencies: ResolveDependencies
}): MaybePromise<Injectable> {
  const { context, token, checker, resolveDependencies } = input

  const singleton = getSingleton(context, token)
  if (singleton) {
    return singleton
  }

  const provider = getProvider(context, token)
  if (!provider) {
    throw new Error(`"${tokenToString(token)}" not registered.`)
  }

  if (isValueProvider(provider)) {
    return provider.useValue
  }

  if (isClassProvider(provider) || isFactoryProvider(provider)) {
    const dependencyMaybePromises = getDependencyMaybePromises({
      context,
      checker,
      provider,
      resolveDependencies,
    })

    return resolveDependencies({
      dependencyMaybePromises,
      provider,
      singletons: context.singletons,
      token,
    })
  }

  const _: never = provider
  throw new Error('Unexpected provider.')
}

function getDeclaration(provider: DependentProvider): Declaration {
  if (isClassProvider(provider)) {
    return provider.useClass[inject] ?? {}
  }

  if (isFactoryProvider(provider)) {
    return provider.inject ?? {}
  }

  const _: never = provider
  throw new Error('Unexpected provider.')
}

function createInstance(input: {
  token: Token<Injectable>
  provider: DependentProvider
  dependencies: Dependencies<Declaration>
  sync: boolean
}): MaybePromise<Injectable> {
  const { token, provider, dependencies, sync } = input

  if (isClassProvider(provider)) {
    const { useClass } = provider

    const instance = new useClass(dependencies)

    let postConstructResult: MaybePromise<void> | null = null
    if (postConstruct in instance) {
      postConstructResult = (instance as PostConstructable)[postConstruct]()
    }

    if (postConstructResult instanceof Promise) {
      if (sync) {
        throw new Error(
          `Cannot resolve "${tokenToString(token)}" (${useClass.name}) synchronously: postConstruct returns Promise.`,
        )
      }

      return postConstructResult.then(() => instance)
    }

    return instance
  }

  if (isFactoryProvider(provider)) {
    const factoryResult = provider.useFactory(dependencies)

    if (factoryResult instanceof Promise) {
      if (sync) {
        throw new Error(
          `Cannot resolve "${tokenToString(token)}" synchronously: useFactory returns Promise.`,
        )
      }
    }

    return factoryResult
  }

  const _: never = provider
  throw new Error('Unexpected provider.')
}

function registerSingletonByScope(input: {
  singletons: Singletons
  token: Token<Injectable>
  instance: Injectable
  scope?: Scope
}) {
  const { singletons, token, instance, scope = 'singleton' } = input

  if (scope === 'singleton') {
    singletons.set(token, instance)
  }
}
