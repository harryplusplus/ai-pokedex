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
