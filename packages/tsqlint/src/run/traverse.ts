import fs from 'node:fs'
import path from 'node:path'

import micromatch from 'micromatch'

import type { Ignores } from './options.ts'

export async function* traverse(input: {
  signal: AbortSignal
  paths: string[]
  ignores: string[]
}): AsyncGenerator<string> {
  const { signal, paths, ignores } = input

  const visitSet = new Set<string>()

  for (const currentPath of paths) {
    const stream = traverseRecursive({
      signal,
      currentPath,
    })

    for await (const sourcePath of stream) {
      if (signal.aborted) {
        break
      }

      if (isIgnored(sourcePath, ignores)) {
        continue
      }

      if (visitSet.has(sourcePath)) {
        continue
      }

      visitSet.add(sourcePath)

      yield sourcePath
    }
  }
}

async function* traverseRecursive(input: {
  signal: AbortSignal
  currentPath: string
}): AsyncGenerator<string> {
  const { signal, currentPath } = input

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
      if (signal.aborted) {
        return
      }

      const joinedPath = path.join(pathInfo.parentPath, pathInfo.name)

      if (pathInfo.isFile()) {
        yield joinedPath

        continue
      }

      if (pathInfo.isDirectory()) {
        yield* traverseRecursive({
          signal,
          currentPath: joinedPath,
        })
      }
    }
  }
}

function isIgnored(currentPath: string, ignores: Ignores): boolean {
  return micromatch.isMatch(currentPath, ignores)
}
