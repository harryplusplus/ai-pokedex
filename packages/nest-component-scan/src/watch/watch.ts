import chokidar, { ChokidarOptions } from 'chokidar'

import {
  createWorkerPool,
  DEFAULT_IMPORT_EXTENSION,
  DEFAULT_OUT_FILE_PATH,
  ensureOutDirPath,
  generateFile,
  ImportExtension,
} from '../shared.js'
import { WatchContext } from './context.js'

const POLL_INTERVAL_IN_MS = 200

export type Paths = Parameters<typeof chokidar.watch>[0]
export type Ignored = NonNullable<ChokidarOptions['ignored']>

export interface WatchOptions {
  paths: Paths
  ignored?: Ignored
  signal: AbortSignal
  outFilePath?: string
  importExtension?: ImportExtension
}

export async function watch(options: WatchOptions): Promise<void> {
  const {
    paths,
    ignored = [],
    signal,
    outFilePath = DEFAULT_OUT_FILE_PATH,
    importExtension = DEFAULT_IMPORT_EXTENSION,
  } = options

  const outDirPath = await ensureOutDirPath(outFilePath)

  await using pool = createWorkerPool()

  const context = new WatchContext()

  const resolvedIgnored = resolveIgnored(ignored, outFilePath)

  const watcher = chokidar.watch(paths, {
    ignored: resolvedIgnored,
    atomic: true,
  })

  const onChange = (sourceFilePath: string): void => {
    pool
      .run({ sourceFilePath, outDirPath, importExtension }, { signal })
      .then((componentInfos) => {
        context.set(sourceFilePath, componentInfos)
      })
      .catch((_e) => {
        // TODO: logging
      })
  }

  watcher.on('add', onChange)
  watcher.on('change', onChange)
  watcher.on('unlink', (sourceFilePath) => {
    context.delete(sourceFilePath)
  })

  while (true) {
    if (signal.aborted) {
      break
    }

    const fileContents = context.getFileContentsIfChanged()
    if (fileContents) {
      await generateFile({ fileContents, outFilePath })

      continue
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_IN_MS))
  }

  await watcher.close()
}

function resolveIgnored(ignored: Ignored, outFilePath: string) {
  const ignoredList = Array.isArray(ignored) ? ignored : [ignored]
  return new Set([...ignoredList, outFilePath]).values().toArray()
}
