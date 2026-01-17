import type { OnCreatable } from '../definition/class-definition.ts'
import type { Any, Injectable, MaybePromise } from '../definition/common.ts'
import { type Dependencies } from '../definition/declaration.ts'
import {
  type Definition,
  definitionToDeclaration,
  isClassDefinition,
  isFactoryDefinition,
} from '../definition/definition.ts'
import { onCreate } from '../definition/symbol.ts'
import { isClassToken, type Token, tokenToString } from '../definition/token.ts'
import { CircularDependencyChecker } from './circular-dependency-checker.ts'
import type { ContainerContext } from './container.ts'
import { DependenciesResolver } from './dependencies-resolver.ts'
import type { FilledOptions } from './options.ts'

interface OnAwaitOrThrowInput {
  token: Token<Any>
  definition: Definition<Any, Any>
  dependenciesResolver: DependenciesResolver
}

export class SingletonResolver {
  readonly #context: ContainerContext
  readonly #options: FilledOptions

  constructor(context: ContainerContext, options: FilledOptions) {
    this.#context = context
    this.#options = options
  }

  async resolve<T extends Injectable>(token: Token<T>): Promise<T> {
    const checker = new CircularDependencyChecker()
    checker.push(token)

    const instance = await this.#resolve({
      token,
      checker,
      onAwaitOrThrow: this.#onAwait.bind(this),
    })

    return instance as T
  }

  async #onAwait(input: OnAwaitOrThrowInput): Promise<object> {
    const { token, definition, dependenciesResolver } = input

    const dependencies = await dependenciesResolver.resolve()
    const instance = await definitionToInstance(definition, dependencies)

    this.#context.singletons.set(token, instance)

    this.#logCreated(token)

    return instance
  }

  resolveSync<T extends object>(token: Token<T>): T {
    const checker = new CircularDependencyChecker()
    checker.push(token)

    const result = this.#resolve({
      token,
      checker,
      onAwaitOrThrow: this.#onThrow.bind(this),
    })

    if (result instanceof Promise) {
      throw new Error('Promise is not allowed.')
    }

    return result as T
  }

  #onThrow(input: OnAwaitOrThrowInput): object {
    const { token, definition, dependenciesResolver } = input

    const dependencies = dependenciesResolver.resolveSync()

    const instance = definitionToInstance(definition, dependencies)
    if (instance instanceof Promise) {
      throw new Error(
        `${tokenToString(token)} returned \`Promise\` in \`reserveSync()\`.`,
      )
    }

    this.#context.singletons.set(token, instance)

    this.#logCreated(token)

    return instance
  }

  #resolve(input: {
    token: Token<Any>
    checker: CircularDependencyChecker
    onAwaitOrThrow: (input: OnAwaitOrThrowInput) => MaybePromise<object>
  }): MaybePromise<object> {
    const { token, checker, onAwaitOrThrow } = input

    const singleton = this.#context.singletons.get(token)
    if (singleton) {
      return singleton
    }

    const definition = this.#resolveDefinition(token)
    const declaration = definitionToDeclaration(definition)
    const dependenciesResolver = new DependenciesResolver(token)

    for (const [name, item] of Object.entries(declaration)) {
      const singleton = this.#context.singletons.get(item)
      if (singleton) {
        dependenciesResolver.set(name, singleton)

        continue
      }

      checker.push(item)

      const dependencyPromise = this.#resolve({
        token: item,
        checker,
        onAwaitOrThrow,
      })

      dependenciesResolver.set(name, dependencyPromise)
    }

    return onAwaitOrThrow({
      token,
      definition,
      dependenciesResolver,
    })
  }

  #logCreated(token: Token<Any>) {
    this.#options.logger.debug(`[${tokenToString(token)}] singleton created.`)
  }

  #resolveDefinition(token: Token<Any>): Definition<Any, Any> {
    const definition = this.#context.definitions.get(token)
    if (definition) {
      return definition
    }

    if (isClassToken(token)) {
      // NOTE: Auto providing.

      this.#context.definitions.set(token, token)
      return token
    }

    throw new Error(`${tokenToString(token)} was not provided.`)
  }
}

function definitionToInstance(
  definition: Definition<Injectable, Any>,
  dependencies: Dependencies<Any>,
): MaybePromise<Injectable> {
  if (isClassDefinition(definition)) {
    const instance = new definition(dependencies)

    let onCreateResult: MaybePromise<void> | null = null
    if (onCreate in instance) {
      const onCreatable = instance as OnCreatable

      onCreateResult = onCreatable[onCreate]()
    }

    if (onCreateResult instanceof Promise) {
      return onCreateResult.then(() => instance)
    } else {
      return instance
    }
  } else if (isFactoryDefinition(definition)) {
    return definition.fn(dependencies)
  } else {
    throw new Error('Invalid definition.')
  }
}
