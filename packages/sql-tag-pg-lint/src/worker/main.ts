import fs from 'node:fs'

import type { TaggedTemplateExpression } from '@swc/core'
import { parseFile } from '@swc/core'

import type { WorkerInput, WorkerOutput } from '../shared.ts'

export default async function main(input: WorkerInput): Promise<WorkerOutput> {
  const module = await parseFile(input, {
    syntax: 'typescript',
    decorators: true,
  })

  const moduleStart = module.span.start

  const queryDataList: {
    query: string
    start: number
  }[] = []

  walk(module, (node) => {
    const { template, tag } = node

    let isSqlTag = false

    if (tag.type === 'CallExpression') {
      const { callee } = tag

      if (callee.type === 'Identifier') {
        if (callee.value.toLowerCase() === 'sql') {
          isSqlTag = true
        }
      }
    }

    if (!isSqlTag) {
      return
    }

    const { quasis, span } = template

    let query = ''
    const lastIdx = quasis.length - 1
    for (let i = 0; i < quasis.length; ++i) {
      const quasi = quasis[i]
      if (!quasi.cooked) {
        throw new Error(`Invalid sql tagged template. ${JSON.stringify(quasi)}`)
      }

      query += quasi.cooked
      if (i < lastIdx) {
        query += `$${i + 1}`
      }
    }

    const start = span.start - moduleStart

    queryDataList.push({
      query,
      start,
    })
  })

  if (queryDataList.length === 0) {
    return []
  }

  const fileContents = await fs.promises.readFile(input, 'utf8')

  const queryInfos = queryDataList.map(({ query, start }) => {
    const { line, column } = calculateLineColumn(fileContents, start)

    return {
      query,
      line,
      column,
    }
  })

  return queryInfos
}

interface Visitor {
  (node: TaggedTemplateExpression): void
}

function walk(node: unknown, visitor: Visitor): void {
  if (!(node && typeof node === 'object')) {
    return
  }

  if ('type' in node) {
    if (node.type === 'TaggedTemplateExpression') {
      visitor(node as TaggedTemplateExpression)
    }
  }

  for (const property of Object.values(node)) {
    if (Array.isArray(property)) {
      for (const item of property) {
        walk(item, visitor)
      }
    } else {
      walk(property, visitor)
    }
  }
}

function calculateLineColumn(
  fileContents: string,
  spanStart: number,
): { line: number; column: number } {
  const lines = fileContents.slice(0, spanStart).split('\n')

  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  }
}
