import fs from 'node:fs'

import {
  AST_NODE_TYPES,
  parse,
  type TSESTree,
} from '@typescript-eslint/typescript-estree'

import type { ParsedItem, WorkerInput, WorkerOutput } from '../shared.ts'

const ALLOWED_TAGS = ['sql']

export default async function main(input: WorkerInput): Promise<WorkerOutput> {
  const source = await fs.promises.readFile(input, 'utf8')

  const program = parse(source, {
    loc: true,
    comment: true,
  })

  const parsedItems: ParsedItem[] = []

  walk(program, (node) => {
    const { tag, quasi } = node

    let identifierNode: TSESTree.Expression | null = null
    if (tag.type === AST_NODE_TYPES.Identifier) {
      identifierNode = tag
    } else if (tag.type === AST_NODE_TYPES.CallExpression) {
      const { callee } = tag

      if (callee.type === AST_NODE_TYPES.Identifier) {
        identifierNode = callee
      }
    }

    if (!identifierNode) {
      return
    }

    if (!ALLOWED_TAGS.includes(identifierNode.name.toLowerCase())) {
      return
    }

    const { quasis } = quasi
    let query = ''
    const lastIdx = quasis.length - 1
    for (let i = 0; i < quasis.length; ++i) {
      const quasi = quasis[i]
      query += quasi.value.cooked

      if (i < lastIdx) {
        query += `$${i + 1}`
      }
    }

    parsedItems.push({
      kind: 'query',
      location: {
        path: input,
        line: quasi.loc.start.line,
        column: quasi.loc.start.column,
      },
      query,
    })
  })

  return parsedItems
}

const TO_SKIP_PROPERTY_KEYS = ['loc', 'comments']

function walk(
  node: unknown,
  visitor: (node: TSESTree.TaggedTemplateExpression) => void,
): void {
  if (!node || typeof node !== 'object') {
    return
  }

  if ('type' in node && node.type === AST_NODE_TYPES.TaggedTemplateExpression) {
    visitor(node as TSESTree.TaggedTemplateExpression)
  }

  for (const [key, value] of Object.entries(node)) {
    if (TO_SKIP_PROPERTY_KEYS.includes(key)) {
      continue
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        walk(item, visitor)
      }
    } else {
      walk(value, visitor)
    }
  }
}
