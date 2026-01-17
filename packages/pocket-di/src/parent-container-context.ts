import type { ContainerContext } from './container-context.ts'

export class ParentContainerContext {
  readonly #context: ContainerContext

  constructor(context: ContainerContext) {
    this.#context = context
  }
}
