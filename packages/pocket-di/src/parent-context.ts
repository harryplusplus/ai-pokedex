import type { ContainerContext } from './container-context.ts'

export class ParentContext {
  readonly #context: ContainerContext

  constructor(context: ContainerContext) {
    this.#context = context
  }
}
