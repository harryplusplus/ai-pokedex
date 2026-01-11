import { ComponentInfo, createFileContents } from '../shared.js'

type FilePath = string

export class WatchContext {
  #map = new Map<FilePath, ComponentInfo[]>()
  #componentChanged = false
  #lastFileContents = ''

  set(sourceFilePath: FilePath, componentInfos: ComponentInfo[]): void {
    this.#map.set(sourceFilePath, componentInfos)
    this.#componentChanged = true
  }

  delete(sourceFilePath: FilePath): void {
    if (this.#map.delete(sourceFilePath)) {
      this.#componentChanged = true
    }
  }

  getFileContentsIfChanged(): string | null {
    if (this.#componentChanged) {
      this.#componentChanged = false

      const componentInfos = this.#map
        .values()
        .flatMap((x) => x)
        .toArray()

      const fileContents = createFileContents({ componentInfos })
      if (fileContents !== this.#lastFileContents) {
        this.#lastFileContents = fileContents

        return fileContents
      }
    }

    return null
  }
}
