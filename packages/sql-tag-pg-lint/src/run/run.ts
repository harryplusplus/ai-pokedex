import path from 'node:path'

import { Piscina } from 'piscina'

import type { QueryInfo, WorkerInput, WorkerOutput } from '../shared.ts'
import type { Pool, RunOptions } from './options.ts'
import { fillRunOptions } from './options.ts'
import { traverse } from './traverse.ts'
import { toErrorString } from './utils.ts'

const workerMainFilePath = path.resolve(
  import.meta.dirname,
  '../worker/main' + path.extname(import.meta.filename),
)

export interface LintInfo {
  path: string
  line: number
  column: number
  error: string | null
}

export type RunOutput = LintInfo

type LintInfoPromiseSet = Set<Promise<LintInfo>>

export async function* run(options: RunOptions): AsyncGenerator<RunOutput> {
  const { signal, pool, paths, ignores } = fillRunOptions(options)

  // Check connection.
  const client = await pool.connect()
  client.release()

  const isProductionDone = {
    flag: false,
  }
  const lintInfoPromiseSet: LintInfoPromiseSet = new Set<Promise<LintInfo>>()

  void produce({
    signal,
    pool,
    paths,
    ignores,
    lintInfoPromiseSet,
  }).finally(() => {
    isProductionDone.flag = true
  })

  yield* consume({
    signal,
    isProductionDone,
    lintInfoPromiseSet,
  })
}

async function* consume(input: {
  signal: AbortSignal
  isProductionDone: {
    flag: boolean
  }
  lintInfoPromiseSet: LintInfoPromiseSet
}): AsyncGenerator<LintInfo> {
  const { signal, isProductionDone, lintInfoPromiseSet } = input

  while (true) {
    if (signal.aborted) {
      break
    }

    if (lintInfoPromiseSet.size > 0) {
      const lintInfo = await Promise.race(lintInfoPromiseSet)

      if (lintInfo) {
        yield lintInfo
      }

      continue
    }

    if (isProductionDone.flag) {
      break
    }

    await new Promise((resolve) => setImmediate(resolve))
  }
}

async function produce(input: {
  signal: AbortSignal
  pool: Pool
  paths: string[]
  ignores: string[]
  lintInfoPromiseSet: LintInfoPromiseSet
}) {
  const { signal, pool, paths, ignores, lintInfoPromiseSet } = input

  await using workerPool = new Piscina<WorkerInput, WorkerOutput>({
    filename: workerMainFilePath,
  })

  const stream = traverse({
    signal,
    paths,
    ignores,
  })

  const parsePromiseSet = new Set<Promise<void>>()

  for await (const sourceFilePath of stream) {
    if (signal.aborted) {
      break
    }

    const parsePromise = parse({
      signal,
      pool,
      workerPool,
      sourceFilePath,
      lintInfoPromiseSet,
    })

    parsePromiseSet.add(parsePromise)
    void parsePromise.finally(() => parsePromiseSet.delete(parsePromise))
  }

  while (true) {
    if (signal.aborted) {
      break
    }

    if (parsePromiseSet.size === 0) {
      break
    }

    await new Promise((resolve) => setImmediate(resolve))
  }
}

async function parse(input: {
  signal: AbortSignal
  pool: Pool
  workerPool: Piscina<WorkerInput, WorkerOutput>
  sourceFilePath: string
  lintInfoPromiseSet: LintInfoPromiseSet
}): Promise<void> {
  const { signal, pool, workerPool, sourceFilePath, lintInfoPromiseSet } = input

  const queryInfos = await workerPool.run(sourceFilePath)

  for (const queryInfo of queryInfos) {
    if (signal.aborted) {
      break
    }

    const lintInfoPromise = doPrepare({
      pool,
      sourceFilePath,
      queryInfo,
    })

    lintInfoPromiseSet.add(lintInfoPromise)

    void lintInfoPromise.finally(() =>
      lintInfoPromiseSet.delete(lintInfoPromise),
    )
  }
}

async function doPrepare(input: {
  pool: Pool
  sourceFilePath: string
  queryInfo: QueryInfo
}): Promise<LintInfo> {
  const { queryInfo, sourceFilePath, pool } = input
  const { query, line, column } = queryInfo

  const name = `sql_tag_pg_lint_${crypto.randomUUID()}`.replaceAll('-', '_')

  let isSuccess = false
  let error: string | null = null
  try {
    await pool.query(`PREPARE ${name} AS ${query}`)
    isSuccess = true
  } catch (e) {
    error = toErrorString(e)
  }

  if (isSuccess) {
    try {
      await pool.query(`DEALLOCATE ${name}`)
    } catch (_e) {
      // noop
    }
  }

  return {
    path: sourceFilePath,
    line,
    column,
    error,
  }
}
