import chokidar from 'chokidar'
import { on } from 'node:events'
import fs from 'node:fs'
import path from 'node:path'
import {
  Component,
  createWorkerPool,
  DEFAULT_IMPORT_EXTENSION,
  DEFAULT_OUT_FILE,
  generateFile,
  ImportExtension,
} from './shared.js'

export interface WatchOptions {
  paths: string | string[]
  ignored?: string | string[]
  signal: AbortSignal
  outFile?: string
  importExtension?: ImportExtension
}

export async function watch(options: WatchOptions): Promise<void> {
  const {
    paths,
    ignored,
    signal,
    outFile = DEFAULT_OUT_FILE,
    importExtension = DEFAULT_IMPORT_EXTENSION,
  } = options

  const outDir = path.dirname(outFile)
  await fs.promises.mkdir(outDir, { recursive: true })

  await using pool = createWorkerPool()

  const ignoredArr = Array.isArray(ignored) ? ignored : ignored ? [ignored] : []
  ignoredArr.push(outFile)

  const watcher = chokidar.watch(paths, {
    ignored: ignoredArr,
    persistent: true,
    ignoreInitial: false,
    atomic: true,
    awaitWriteFinish: true,
  })

  const componentMap = new ComponentMap()

  generateLoop({ componentMap, outFile, signal }).catch((_e) => {
    // TODO: logging
  })

  try {
    for await (const [event, path_] of on(watcher, 'all', { signal })) {
      if (event === 'add' || event === 'change') {
        const sourceFile = String(path_)
        pool
          .run({ sourceFile, outDir, importExtension }, { signal })
          .then((workerOutput) => {
            componentMap.set(sourceFile, workerOutput.components)
          })
          .catch((_e) => {
            // TODO: logging
          })
      } else if (event === 'unlink') {
        componentMap.delete(String(path_))
      } else if (event === 'unlinkDir') {
        componentMap.deleteByDir(String(path_))
      }
    }
  } finally {
    await watcher.close()
  }
}

const POLL_INTERVAL_IN_MS = 200

async function generateLoop(input: {
  signal: AbortSignal
  componentMap: ComponentMap
  outFile: string
}) {
  const { signal, componentMap, outFile } = input

  while (true) {
    if (signal.aborted) {
      break
    }

    const components = componentMap.tryGet()
    if (components) {
      await generateFile({ components, outFile })
      console.log(`${new Date().toISOString()} ${outFile} generated.`)
    } else {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_IN_MS))
    }
  }
}

class ComponentMap {
  #lastChangedEvent: string | null = null
  #map = new Map<string, Component[]>()

  set(sourceFile: string, components: Component[]): void {
    this.#map.set(sourceFile, components)
    this.#lastChangedEvent = `${new Date().toISOString()} set ${sourceFile}`
  }

  delete(sourceFile: string): void {
    this.#map.delete(sourceFile)
    this.#lastChangedEvent = `${new Date().toISOString()} delete ${sourceFile}`
  }

  deleteByDir(dir: string): void {
    this.#map
      .keys()
      .filter((x) => x.startsWith(dir))
      .forEach((sourceFile) => {
        this.#map.delete(sourceFile)
      })

    this.#lastChangedEvent = `${new Date().toISOString()} deleteByDir ${dir}`
  }

  tryGet(): Component[] | null {
    if (this.#lastChangedEvent) {
      console.log(`lastChangedEvent: ${this.#lastChangedEvent}`)
      this.#lastChangedEvent = null

      const components = this.#map
        .values()
        .flatMap((x) => x)
        .toArray()

      return components
    }

    return null
  }
}
