import fs from 'node:fs'

import {
  AST_NODE_TYPES,
  parse,
  type TSESTree,
} from '@typescript-eslint/typescript-estree'

import type { ParsedItem, WorkerInput, WorkerOutput } from '../shared.ts'

export default async function main(input: WorkerInput): Promise<WorkerOutput> {
  const { sourcePath } = input

  const source = await fs.promises.readFile(sourcePath, 'utf8')

  const program = parse(source, {
    loc: true,
  })

  const parsedItems: ParsedItem[] = []

  walk(program, (node) => {
    const tagName = findTagName(node)
    if (!tagName) {
      return
    }

    if (!isAllowedTagName(tagName)) {
      return
    }

    const query = buildQuery(node)

    parsedItems.push({
      kind: 'query',
      location: {
        path: sourcePath,
        line: node.loc.start.line,
        column: node.loc.start.column,
      },
      query,
    })
  })

  return parsedItems
}

const SKIP_PROPERTY_KEYS = ['loc', 'comments']

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
    if (SKIP_PROPERTY_KEYS.includes(key)) {
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

function findTagName(node: TSESTree.TaggedTemplateExpression): string | null {
  const { tag } = node

  if (tag.type === AST_NODE_TYPES.Identifier) {
    return tag.name
  }

  if (tag.type === AST_NODE_TYPES.CallExpression) {
    const { callee } = tag

    if (callee.type === AST_NODE_TYPES.Identifier) {
      return callee.name
    }
  }

  return null
}

const ALLOWED_TAG_NAMES = ['sql']

function isAllowedTagName(tagName: string): boolean {
  return ALLOWED_TAG_NAMES.includes(tagName.toLowerCase())
}

function buildQuery(node: TSESTree.TaggedTemplateExpression): string {
  const { quasis } = node.quasi

  let query = ''
  const lastIdx = quasis.length - 1
  for (let i = 0; i < quasis.length; ++i) {
    const quasi = quasis[i]
    query += quasi.value.cooked

    if (i < lastIdx) {
      query += `$${i + 1}`
    }
  }

  return query
}
