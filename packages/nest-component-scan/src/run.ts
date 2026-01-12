import fs from 'node:fs'
import path from 'node:path'

import {
  createFileContents,
  createWorkerPool,
  ensureOutDirPath,
  fillScanOptions,
  generateFile,
  isIgnored,
  ScanOptions,
  WorkerOutput,
} from './shared.js'

export async function run(options: ScanOptions): Promise<void> {
  const { paths, ignores, signal, outFilePath, importExtension } =
    fillScanOptions(options)

  const outDirPath = await ensureOutDirPath(outFilePath)

  await using pool = createWorkerPool()

  const workerOutputPromises: Promise<WorkerOutput>[] = []

  const visitSet = new Set<string>()
  const ignoreList = [...ignores, outFilePath]

  for (const currentPath of paths) {
    const stream = traverse(currentPath)

    for await (const sourceFilePath of stream) {
      if (signal.aborted) {
        break
      }

      if (isIgnored(sourceFilePath, ignoreList)) {
        continue
      }

      if (visitSet.has(sourceFilePath)) {
        continue
      }

      visitSet.add(sourceFilePath)

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
  }

  const workerOutputs = await Promise.all(workerOutputPromises)

  const componentInfos = workerOutputs
    .flatMap((x) => x)
    .values()
    .toArray()

  const fileContents = createFileContents({ componentInfos })
  await generateFile({ fileContents, outFilePath })
}

async function* traverse(currentPath: string): AsyncGenerator<string> {
  const stat = await fs.promises.stat(currentPath).catch(() => null)
  if (!stat) {
    return
  }

  if (stat.isFile()) {
    yield currentPath
    return
  }

  if (stat.isDirectory()) {
    const pathInfos = await fs.promises.readdir(currentPath, {
      withFileTypes: true,
      encoding: 'utf8',
    })

    for (const pathInfo of pathInfos) {
      const relativePath = path.join(pathInfo.parentPath, pathInfo.name)

      if (pathInfo.isFile()) {
        yield relativePath
      } else if (pathInfo.isDirectory()) {
        yield* traverse(relativePath)
      }
    }
  }
}
