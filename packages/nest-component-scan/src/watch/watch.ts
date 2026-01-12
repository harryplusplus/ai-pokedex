import chokidar from 'chokidar'

import {
  createWorkerPool,
  ensureOutDirPath,
  fillScanOptions,
  generateFile,
  isIgnored,
  ScanOptions,
} from '../shared.js'
import { WatchContext } from './context.js'

const POLL_INTERVAL_IN_MS = 200

export async function watch(options: ScanOptions): Promise<void> {
  const { paths, ignores, signal, outFilePath, importExtension } =
    fillScanOptions(options)

  const outDirPath = await ensureOutDirPath(outFilePath)

  await using pool = createWorkerPool()

  const context = new WatchContext()

  const ignoreList = [...ignores, outFilePath]

  const watcher = chokidar.watch(paths, {
    ignored: (currentPath) => isIgnored(currentPath, ignoreList),
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
