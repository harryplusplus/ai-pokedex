import { ComponentInfo } from '../shared.js'

type FilePath = string

export class WatchContext {
  #changed = false
  #map = new Map<FilePath, ComponentInfo[]>()

  set(sourceFilePath: FilePath, componentInfos: ComponentInfo[]): void {
    this.#map.set(sourceFilePath, componentInfos)

    if (componentInfos.length > 0) {
      this.#changed = true
    }
  }

  delete(sourceFilePath: FilePath): void {
    if (this.#map.delete(sourceFilePath)) {
      this.#changed = true
    }
  }

  getIfChanged(): ComponentInfo[] | null {
    if (this.#changed) {
      this.#changed = false

      const componentInfos = this.#map
        .values()
        .flatMap((x) => x)
        .toArray()

      return componentInfos
    }

    return null
  }
}
