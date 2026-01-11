import { Decorator, parseFile } from '@swc/core'
import path from 'node:path'
import {
  ComponentInfo,
  ComponentKind,
  ImportExtension,
  WorkerInput,
  WorkerOutput,
} from '../shared.js'

const SCANNABLE_DECORATOR_NAME = 'Scannable'
const CONTROLLER_DECORATOR_NAME = 'Controller'
const INJECTABLE_DECORATOR_NAME = 'Injectable'

export default async function main(input: WorkerInput): Promise<WorkerOutput> {
  const { sourceFilePath, outDirPath, importExtension } = input

  const module = await parseFile(sourceFilePath, {
    syntax: 'typescript',
    decorators: true,
  })

  const componentInfos: ComponentInfo[] = []

  for (const moduleItem of module.body) {
    if (moduleItem.type === 'ExportDeclaration') {
      const { declaration } = moduleItem

      if (declaration.type === 'ClassDeclaration') {
        const { decorators = [] } = declaration

        const parseDecoratorsOutput = parseDecorators(decorators)

        const analyzeDecoratorsOutput = analyzeDecorators({
          ...parseDecoratorsOutput,
          name: declaration.identifier.value,
        })

        if (analyzeDecoratorsOutput) {
          const importPath = resolveImportPath({
            sourceFilePath,
            outDirPath,
            importExtension,
          })

          const importLine = `import { ${analyzeDecoratorsOutput.name} } from "${importPath}";`

          componentInfos.push({
            ...analyzeDecoratorsOutput,
            importLine,
          })
        }
      }
    }
  }

  return componentInfos
}

interface ParseDecoratorsOutput {
  hasScannable: boolean
  hasController: boolean
  hasInjectable: boolean
}

function parseDecorators(decorators: Decorator[]): ParseDecoratorsOutput {
  let hasScannable = false
  let hasController = false
  let hasInjectable = false

  for (const decorator of decorators) {
    const { expression } = decorator

    if (expression.type === 'CallExpression') {
      const { callee } = expression

      if (callee.type === 'Identifier') {
        if (callee.value === SCANNABLE_DECORATOR_NAME) {
          hasScannable = true
        } else if (callee.value === CONTROLLER_DECORATOR_NAME) {
          hasController = true
        } else if (callee.value === INJECTABLE_DECORATOR_NAME) {
          hasInjectable = true
        }
      }
    }
  }

  return {
    hasScannable,
    hasController,
    hasInjectable,
  }
}

interface AnalyzeDecoratorsOutput {
  kind: ComponentKind
  name: string
}

function analyzeDecorators(
  input: ParseDecoratorsOutput & { name: string },
): AnalyzeDecoratorsOutput | null {
  const { hasController, hasInjectable, hasScannable, name } = input

  if (hasScannable) {
    if (hasController && hasInjectable) {
      // TODO: error handling
    } else if (hasController) {
      return {
        kind: 'controller',
        name,
      }
    } else if (hasInjectable) {
      return {
        kind: 'injectable',
        name,
      }
    }
  }

  return null
}

function resolveImportPath(input: {
  sourceFilePath: string
  outDirPath: string
  importExtension: ImportExtension
}): string {
  const { sourceFilePath, outDirPath, importExtension } = input

  const relativePath = path.relative(outDirPath, sourceFilePath)

  if (importExtension == null) {
    return relativePath
  }

  const extension = path.extname(relativePath)
  const withoutExtension = relativePath.slice(0, -extension.length)

  return `${withoutExtension}${importExtension}`
}
