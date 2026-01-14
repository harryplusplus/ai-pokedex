/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

export const inject: unique symbol = Symbol('inject')

export type Class<T = any> = Function & {
  [inject]: Record<string, Class>
  new (...args: any[]): T
}

export class Container {
  #injectables = new Map<Class, Class>()
  #singletons = new Map<Class, InstanceType<Class>>()

  provide(injectable: Class): this {
    if (this.#injectables.has(injectable)) {
      throw new Error(`${injectable.name} already exists.`)
    }

    this.#injectables.set(injectable, injectable)

    return this
  }

  resolve<T extends Class>(injectable: T): InstanceType<T> {
    return this.#resolve(injectable, new Set([injectable]))
  }

  #resolve<T extends Class>(
    injectable: T,
    callChain: Set<Class>,
  ): InstanceType<T> {
    const singleton = this.#singletons.get(injectable)
    if (singleton) {
      return singleton
    }

    const registered = this.#injectables.get(injectable)
    if (!registered) {
      throw new Error(`${injectable.name} was not provided.`)
    }

    const deps: Record<string, InstanceType<Class>> = {}

    for (const [name, depInjectable] of Object.entries(registered[inject])) {
      {
        const depInstance = this.#singletons.get(depInjectable)
        if (depInstance) {
          deps[name] = depInstance

          continue
        }
      }

      if (callChain.has(depInjectable)) {
        throw new Error(
          `Circular dependency detected. ${[...callChain.values()]
            .map((x) => x.name)
            .join(' -> ')}`,
        )
      }

      callChain.add(depInjectable)
      const depInstance = this.#resolve(depInjectable, callChain)
      deps[name] = depInstance
    }

    const instance = new injectable(deps)
    this.#singletons.set(injectable, instance)

    return instance
  }
}

export type Injected<T> = T extends { [inject]: infer I }
  ? {
      [K in keyof I]: I[K] extends abstract new (...args: any[]) => infer R
        ? R
        : never
    }
  : never
