import {
  formatLocation,
  type Location,
  type QueryParsedItem,
} from '../shared.ts'
import type { DataSource, RunOptions } from './options.ts'
import { fillRunOptions } from './options.ts'
import { traverse } from './traverse.ts'
import { parseErrorMessage } from './utils.ts'
import { type Spawn, WaitGroup } from './wait-group.ts'
import { createWorkerPool, type WorkerPool } from './worker-pool.ts'

export interface ValidLintItem {
  kind: 'valid'
  location: Location
}

export interface InvalidLintItem {
  kind: 'invalid'
  location: Location
  error: string
}

export interface SkippedLintItem {
  kind: 'skipped'
  location: Location
}

export type LintItem = ValidLintItem | InvalidLintItem | SkippedLintItem

export async function* run(options: RunOptions): AsyncGenerator<LintItem> {
  const { signal, dataSource, paths, ignores } = fillRunOptions(options)

  await using workerPool = createWorkerPool()

  const waitGroup = new WaitGroup()
  const spawn = waitGroup.createSpawn()

  const queue: LintItem[] = []

  spawn('doProduce', () =>
    doProduce({
      signal,
      spawn,
      queue,
      paths,
      ignores,
      dataSource,
      workerPool,
    }),
  )

  while (true) {
    if (signal.aborted) {
      break
    }

    if (queue.length === 0 && waitGroup.size === 0) {
      break
    }

    const lintItem = queue.shift()
    if (lintItem) {
      yield lintItem

      continue
    }

    await waitGroup.race()
  }
}

async function doProduce(input: {
  signal: AbortSignal
  spawn: Spawn
  queue: LintItem[]
  paths: string[]
  ignores: string[]
  dataSource: DataSource
  workerPool: WorkerPool
}): Promise<void> {
  const { signal, paths, ignores, spawn, dataSource, queue, workerPool } = input

  const stream = traverse({
    signal,
    paths,
    ignores,
  })

  for await (const sourcePath of stream) {
    if (signal.aborted) {
      break
    }

    spawn(`doParse ${sourcePath}`, () =>
      doParse({
        signal,
        queue,
        spawn,
        dataSource,
        workerPool,
        sourcePath,
      }),
    )
  }
}

async function doParse(input: {
  signal: AbortSignal
  queue: LintItem[]
  spawn: Spawn
  dataSource: DataSource
  workerPool: WorkerPool
  sourcePath: string
}): Promise<void> {
  const { signal, spawn, dataSource, workerPool, sourcePath, queue } = input

  const parsedItems = await workerPool.run({
    sourcePath,
  })

  for (const parsedItem of parsedItems) {
    if (signal.aborted) {
      break
    }

    if (parsedItem.kind === 'skipped') {
      queue.push(parsedItem)

      continue
    }

    const locationString = formatLocation(parsedItem.location)

    spawn(`doPrepare ${locationString}`, () =>
      doPrepare({
        queue,
        dataSource,
        parsedItem,
      }),
    )
  }
}

async function doPrepare(input: {
  queue: LintItem[]
  dataSource: DataSource
  parsedItem: QueryParsedItem
}): Promise<void> {
  const { queue, parsedItem, dataSource } = input
  const { query, location } = parsedItem

  const name = `psqlint_${crypto.randomUUID()}`.replaceAll('-', '_')

  await using connection = await dataSource.connect()

  const error = await connection
    .query(`PREPARE ${name} AS ${query}`)
    .catch((e) => parseErrorMessage(e))

  if (typeof error === 'string') {
    queue.push({
      kind: 'invalid',
      location,
      error,
    })

    return
  }

  await connection.query(`DEALLOCATE ${name}`).catch(() => {})

  queue.push({
    kind: 'valid',
    location,
  })
}
