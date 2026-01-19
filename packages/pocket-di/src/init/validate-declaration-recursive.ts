import type { CircularDependencyChecker } from '../circular-dependency-checker.ts'
import type { Provider } from '../types/provider.ts'
import * as ProviderModule from '../types/provider.ts'
import type { FindProvider } from './find-provider.ts'
import { validateDeclaration } from './validate-declaration.ts'

export function validateDeclarationRecursive(input: {
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
      declaration: ProviderModule.classToDeclaration(provider),
      findProvider,
      className: provider.useClass.name,
      checker,
    })

    return
  }

  if (ProviderModule.isFactory(provider)) {
    validateDeclaration({
      token: provider.provide,
      declaration: ProviderModule.factoryToDeclaration(provider),
      findProvider,
      className: null,
      checker,
    })

    return
  }

  const _: never = provider
  throw new Error('Unexpected provider.')
}
