import type { OnCreatable } from '../definition/class-definition.ts'
import type { Any, Injectable, MaybePromise } from '../definition/common.ts'
import {
  declarationItemToToken,
  type InstanceContext,
} from '../definition/declaration.ts'
import {
  type Definition,
  definitionToDeclaration,
  isClassDefinition,
  isFactoryDefinition,
} from '../definition/definition.ts'
import { onCreate } from '../definition/symbol.ts'
import {
  isDirectToken,
  type Token,
  tokenToString,
} from '../definition/token.ts'
import { CircularDependencyChecker } from './circular-dependency-checker.ts'
import type { ContainerContext } from './container.ts'
import { InstanceContextResolver } from './instance-context-resolver.ts'

interface OnAwaitOrThrowInput {
  token: Token<Any>
  definition: Definition<Any, Any>
  instanceContextResolver: InstanceContextResolver
}

export class SingletonResolver {
  readonly #context: ContainerContext

  constructor(context: ContainerContext) {
    this.#context = context
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
    const { token, definition, instanceContextResolver } = input

    const instanceContext = await instanceContextResolver.resolve()
    const instance = await definitionToInstance(definition, instanceContext)

    this.#context.singletons.set(token, instance)

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
    const { token, definition, instanceContextResolver } = input

    const instanceContext = instanceContextResolver.resolveSync()

    const instance = definitionToInstance(definition, instanceContext)
    if (instance instanceof Promise) {
      throw new Error(
        `${tokenToString(token)} returned \`Promise\` in \`reserveSync()\`.`,
      )
    }

    this.#context.singletons.set(token, instance)

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
    const instanceContextResolver = new InstanceContextResolver(token)

    for (const [name, item] of Object.entries(declaration)) {
      const token = declarationItemToToken(item)

      const singleton = this.#context.singletons.get(token)
      if (singleton) {
        instanceContextResolver.set(name, singleton)

        continue
      }

      checker.push(token)

      const itemPromise = this.#resolve({
        token,
        checker,
        onAwaitOrThrow,
      })

      instanceContextResolver.set(name, itemPromise)
    }

    return onAwaitOrThrow({
      token,
      definition,
      instanceContextResolver,
    })
  }

  #resolveDefinition(token: Token<Any>): Definition<Any, Any> {
    const definition = this.#context.definitions.get(token)
    if (definition) {
      return definition
    }

    if (isDirectToken(token)) {
      // NOTE: Auto providing.

      this.#context.definitions.set(token, token)
      return token
    }

    throw new Error(`${tokenToString(token)} was not provided.`)
  }
}

function definitionToInstance(
  definition: Definition<Injectable, Any>,
  instanceContext: InstanceContext,
): MaybePromise<Injectable> {
  if (isClassDefinition(definition)) {
    const instance = new definition(instanceContext)

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
    return definition.fn(instanceContext)
  } else {
    throw new Error('Invalid definition.')
  }
}
