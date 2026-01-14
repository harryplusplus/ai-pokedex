import { parseFile, TaggedTemplateExpression } from '@swc/core'

import { WorkerInput, WorkerOutput } from '../shared.js'

export default async function main(input: WorkerInput): Promise<WorkerOutput> {
  const module = await parseFile(input, {
    syntax: 'typescript',
  })

  walk(module, {
    onTaggedTemplateExpression: (node) => {
      console.log(node.span)
    },
  })

  return []
}

main(
  '/Users/harry/repo/ai-pokedex/apps/api/src/refresh-token/refresh-token.repo.ts',
).catch((e) => {
  console.error(e)
  process.exit(1)
})

interface Visitor {
  onTaggedTemplateExpression: (node: TaggedTemplateExpression) => void
}

function walk(node: unknown, visitor: Visitor): void {
  if (!(node && typeof node === 'object')) {
    return
  }

  if ('type' in node) {
    if (node.type === 'TaggedTemplateExpression') {
      visitor.onTaggedTemplateExpression(node as TaggedTemplateExpression)
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
