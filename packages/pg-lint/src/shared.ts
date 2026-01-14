import path from 'node:path'

import micromatch from 'micromatch'
import { Piscina } from 'piscina'

const WORKER_MAIN_FILE_PATH = path.resolve(
  import.meta.dirname,
  './worker/main.js',
)

export type Paths = string | string[]
export type Ignores = string | string[]

export function isIgnored(currentPath: string, ignores: Ignores): boolean {
  return micromatch.isMatch(currentPath, ignores)
}

export interface ScanOptions {
  signal: AbortSignal
  paths: Paths
  ignores?: Ignores
}

export interface FilledScanOptions {
  signal: AbortSignal
  paths: string[]
  ignores: string[]
}

export function fillScanOptions(options: ScanOptions): FilledScanOptions {
  return {
    signal: options.signal,
    paths: Array.isArray(options.paths) ? options.paths : [options.paths],
    ignores: Array.isArray(options.ignores)
      ? options.ignores
      : options.ignores
        ? [options.ignores]
        : [],
  }
}

export type WorkerInput = string

export type WorkerOutput = string[]

export function createWorkerPool(): Piscina<WorkerInput, WorkerOutput> {
  return new Piscina<WorkerInput, WorkerOutput>({
    filename: WORKER_MAIN_FILE_PATH,
  })
}
