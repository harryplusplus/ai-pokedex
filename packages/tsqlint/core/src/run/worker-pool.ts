import path from 'node:path'

import { Piscina } from 'piscina'

import type { WorkerInput, WorkerOutput } from '../shared.ts'

const workerMainPath = path.resolve(
  import.meta.dirname,
  '../worker/main' + path.extname(import.meta.filename),
)

export type WorkerPool = Piscina<WorkerInput, WorkerOutput>

export function createWorkerPool(): WorkerPool {
  return new Piscina<WorkerInput, WorkerOutput>({
    filename: workerMainPath,
  })
}
