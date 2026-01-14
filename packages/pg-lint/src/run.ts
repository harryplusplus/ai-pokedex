import fs from 'node:fs'
import path from 'node:path'

import {
  createWorkerPool,
  fillScanOptions,
  isIgnored,
  ScanOptions,
} from './shared.js'

export async function run(options: ScanOptions): Promise<void> {
  const { paths, ignores, signal } = fillScanOptions(options)

  await using pool = createWorkerPool()

  const errors: Promise<string[]>[] = []

  const stream = traverse({ signal, paths, ignores })

  for await (const sourceFilePath of stream) {
    if (signal.aborted) {
      break
    }

    errors.push(
      pool.run(sourceFilePath).then((queries) => {
        // check queries
        return []
      }),
    )
  }
}

async function* traverseInternal(currentPath: string): AsyncGenerator<string> {
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
        yield* traverseInternal(relativePath)
      }
    }
  }
}

async function* traverse(input: {
  signal: AbortSignal
  paths: string[]
  ignores: string[]
}): AsyncGenerator<string> {
  const { signal, paths, ignores } = input

  const visitSet = new Set<string>()

  for (const currentPath of paths) {
    const stream = traverseInternal(currentPath)

    for await (const sourceFilePath of stream) {
      if (signal.aborted) {
        break
      }

      if (isIgnored(sourceFilePath, ignores)) {
        continue
      }

      if (visitSet.has(sourceFilePath)) {
        continue
      }

      visitSet.add(sourceFilePath)

      yield sourceFilePath
    }
  }
}
