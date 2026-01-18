import { CircularDependencyChecker } from '../circular-dependency-checker.ts'
import type { Declaration } from '../declaration.ts'
import type { Dependencies } from '../dependencies.ts'
import type { Injectable } from '../injectable.ts'
import type { Token } from '../token.ts'
import { createInstance } from './create-instance.ts'
import type { DependencyMaybePromises } from './get-dependency-maybe-promises.ts'
import { resolveRecursive } from './resolve-recursive.ts'

export async function resolveAsync<T extends Injectable>(input: {
  context: ContainerContext
  token: Token<T>
}): Promise<T> {
  const { context, token } = input

  const checker = new CircularDependencyChecker()
  checker.push(token)

  const instance = await resolveRecursive(
    {
      checker,
    },
    {
      context,
      token,
      resolveDependencies: resolveDependenciesAsync,
    },
  )

  return instance as T
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

export async function maybePromisesToDependenciesAsync(
  maybePromises: DependencyMaybePromises,
): Promise<Dependencies<Declaration>> {
  const promises = Object.entries(maybePromises).map(async ([key, value]) => {
    return [key, await value] as const
  })

  const entries = await Promise.all(promises)

  return Object.fromEntries(entries)
}
