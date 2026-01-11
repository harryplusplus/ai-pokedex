import fg from 'fast-glob'
import fs from 'node:fs'
import path from 'node:path'

import {
  createWorkerPool,
  DEFAULT_IMPORT_EXTENSION,
  DEFAULT_OUT_FILE,
  generateFile,
  ImportExtension,
  WorkerOutput,
} from './shared.js'

export interface RunOptions {
  pattern: string | string[]
  ignore?: string | string[]
  signal?: AbortSignal
  outFile?: string
  importExtension?: ImportExtension
}

export async function run(options: RunOptions): Promise<void> {
  const {
    pattern,
    ignore,
    signal,
    outFile = DEFAULT_OUT_FILE,
    importExtension = DEFAULT_IMPORT_EXTENSION,
  } = options

  const outDir = path.dirname(outFile)
  await fs.promises.mkdir(outDir, { recursive: true })

  await using pool = createWorkerPool()

  const stream = fg.stream(pattern, {
    ignore: Array.isArray(ignore) ? ignore : ignore ? [ignore] : [],
  })

  const workerOutputPromises: Promise<WorkerOutput>[] = []

  for await (const file of stream) {
    if (signal?.aborted) {
      break
    }

    const sourceFile = file.toString()
    workerOutputPromises.push(
      pool.run({ sourceFile, outDir, importExtension }, { signal }),
    )
  }

  const workerOutputs = await Promise.all(workerOutputPromises)

  const components = workerOutputs.flatMap((x) => x.components)

  await generateFile({ components, outFile })
}
