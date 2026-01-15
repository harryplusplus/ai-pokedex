import { inject } from './symbols.ts'
import {
  type ClassToken,
  type IndirectToken,
  type InjectionToken,
  isClassToken,
  isIndirectToken,
} from './token.ts'
import {
  type Any,
  type Injectable,
  isClassTokenDependency,
  isDependencyDefinition,
} from './types.ts'

export class Container {
  #injectables = new Map<InjectionToken<Any>, Injectable<Any>>()
  #singletons = new Map<InjectionToken<Any>, object>()

  provide<T extends object>(classToken: ClassToken<T>): this
  provide<T extends object>(
    indirectToken: IndirectToken<T>,
    injectable: Injectable<T>,
  ): this
  provide<T extends object>(
    classOrIndirectToken: ClassToken<T> | IndirectToken<T>,
    injectableOrUndefined?: Injectable<T>,
  ): this {
    if (this.#injectables.has(classOrIndirectToken)) {
      throw new Error()
    }

    if (isClassToken(classOrIndirectToken)) {
      this.#injectables.set(classOrIndirectToken, classOrIndirectToken)
    } else if (isIndirectToken(classOrIndirectToken)) {
      if (!injectableOrUndefined) {
        throw new Error()
      }

      this.#injectables.set(classOrIndirectToken, injectableOrUndefined)
    } else {
      throw new Error()
    }

    return this
  }

  resolve<T extends object>(injectionToken: InjectionToken<T>): T {
    return this.#resolve(injectionToken, new Set([injectionToken]))
  }

  #resolve<T extends object>(
    injectionToken: InjectionToken<T>,
    callChain: Set<InjectionToken<Any>>,
  ): T {
    const singleton = this.#singletons.get(injectionToken)
    if (singleton) {
      return singleton as T
    }

    const injectable = this.#injectables.get(injectionToken)
    if (!injectable) {
      throw new Error()
    }

    const dependencies: Record<string, object> = {}
    for (const [name, definition] of Object.entries(injectable[inject])) {
      if (isClassTokenDependency(definition)) {
        const singleton = this.#singletons.get(definition)
        if (singleton) {
          dependencies[name] = singleton

          continue
        }
      } else if (isDependencyDefinition(definition)) {
        definition.
      } else {
        throw new Error()
      }

      // not found
    }
    //   const deps: Record<string, InstanceType<Class>> = {}
    //   for (const [name, depInjectable] of Object.entries(registered[inject])) {
    //     {
    //       const depInstance = this.#singletons.get(depInjectable)
    //       if (depInstance) {
    //         deps[name] = depInstance
    //         continue
    //       }
    //     }
    //     if (callChain.has(depInjectable)) {
    //       throw new Error(
    //         `Circular dependency detected. ${[...callChain.values()]
    //           .map((x) => x.name)
    //           .join(' -> ')}`,
    //       )
    //     }
    //     callChain.add(depInjectable)
    //     const depInstance = this.#resolve(depInjectable, callChain)
    //     deps[name] = depInstance
    //   }
    //   const instance = new injectable(deps)
    //   this.#singletons.set(injectable, instance)
    //   return instance
    // }
  }
}
