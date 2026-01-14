import type { TaggedTemplateExpression } from '@swc/core'
import { parseFile } from '@swc/core'

import type { WorkerInput, WorkerOutput } from '../shared.ts'

export default async function main(input: WorkerInput): Promise<WorkerOutput> {
  const module = await parseFile(input, {
    syntax: 'typescript',
  })

  walk(module, (node) => {
    const { template } = node
    const { quasis } = template

    const sql = ''
    for (let i = 0; i < quasis.length; ++i) {}
  })

  return []
}

main(
  '/Users/harry/repo/ai-pokedex/apps/api/src/refresh-token/refresh-token.repo.ts',
).catch((e) => {
  console.error(e)
  process.exit(1)
})

interface OnTaggedTemplateExpression {
  (node: TaggedTemplateExpression): void
}

function walk(node: unknown, visitor: OnTaggedTemplateExpression): void {
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
