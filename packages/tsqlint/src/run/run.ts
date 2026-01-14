import path from 'node:path'

import { Piscina } from 'piscina'

import type {
  Location,
  QueryParsedItem,
  WorkerInput,
  WorkerOutput,
} from '../shared.ts'
import type { DataSource, RunOptions } from './options.ts'
import { fillRunOptions } from './options.ts'
import { traverse } from './traverse.ts'
import { type Spawn, toErrorString, WaitGroup } from './utils.ts'

const workerMainFilePath = path.resolve(
  import.meta.dirname,
  '../worker/main' + path.extname(import.meta.filename),
)

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

  const waitGroup = new WaitGroup()
  const spawn: Spawn = waitGroup.spawn.bind(waitGroup)

  const queue: LintItem[] = []

  spawn(() =>
    doProduce({
      signal,
      spawn,
      queue,
      paths,
      ignores,
      dataSource,
    }),
  )

  while (true) {
    if (signal.aborted) {
      break
    }

    if (queue.length === 0 && waitGroup.size === 0) {
      break
    }

    const runItem = queue.shift()
    if (runItem) {
      yield runItem

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
}): Promise<void> {
  const { signal, paths, ignores, spawn, dataSource, queue } = input

  const stream = traverse({
    signal,
    paths,
    ignores,
  })

  await using workerPool = new Piscina<WorkerInput, WorkerOutput>({
    filename: workerMainFilePath,
  })

  for await (const sourceFilePath of stream) {
    if (signal.aborted) {
      break
    }

    spawn(() =>
      doParse({
        signal,
        queue,
        spawn,
        dataSource,
        workerPool,
        sourceFilePath,
      }),
    )
  }

  console.log('doProduce end')
}

async function doParse(input: {
  signal: AbortSignal
  queue: LintItem[]
  spawn: Spawn
  dataSource: DataSource
  workerPool: Piscina<WorkerInput, WorkerOutput>
  sourceFilePath: string
}): Promise<void> {
  const { signal, spawn, dataSource, workerPool, sourceFilePath, queue } = input
  console.log('doParse start', sourceFilePath)
  const parsedItems = await workerPool.run(sourceFilePath)
  console.log('parsedItems', parsedItems)
  for (const parsedItem of parsedItems) {
    if (signal.aborted) {
      break
    }

    if (parsedItem.kind === 'skipped') {
      queue.push(parsedItem)

      continue
    }

    spawn(() =>
      doPrepare({
        queue,
        dataSource,
        parsedItem,
      }),
    )
  }

  console.log('doParse end', sourceFilePath)
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
    .catch((e) => toErrorString(e))

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

  console.log('doPrepare', location.path)
}
