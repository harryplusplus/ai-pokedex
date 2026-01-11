import fg from 'fast-glob'
import {
  createWorkerPool,
  DEFAULT_IMPORT_EXTENSION,
  DEFAULT_OUT_FILE_PATH,
  ensureOutDirPath,
  generateFile,
  ImportExtension,
  WorkerOutput,
} from './shared.js'

export type Pattern = Parameters<typeof fg.stream>[0]
export type Ignore = NonNullable<
  NonNullable<Parameters<typeof fg.stream>[1]>['ignore']
>

export interface RunOptions {
  pattern: Pattern
  ignore?: Ignore
  signal?: AbortSignal
  outFilePath?: string
  importExtension?: ImportExtension
}

export async function run(options: RunOptions): Promise<void> {
  const {
    pattern,
    ignore = [],
    signal,
    outFilePath = DEFAULT_OUT_FILE_PATH,
    importExtension = DEFAULT_IMPORT_EXTENSION,
  } = options

  const outDirPath = await ensureOutDirPath(outFilePath)

  await using pool = createWorkerPool()

  const stream = fg.stream(pattern, {
    ignore,
  })

  const workerOutputPromises: Promise<WorkerOutput>[] = []

  for await (const filePath of stream) {
    if (signal?.aborted) {
      break
    }

    const sourceFilePath = filePath.toString()
    workerOutputPromises.push(
      pool.run(
        {
          sourceFilePath,
          outDirPath,
          importExtension,
        },
        {
          signal,
        },
      ),
    )
  }

  const workerOutputs = await Promise.all(workerOutputPromises)

  const componentInfos = workerOutputs
    .flatMap((x) => x)
    .values()
    .toArray()

  await generateFile({ componentInfos, outFilePath })
}
