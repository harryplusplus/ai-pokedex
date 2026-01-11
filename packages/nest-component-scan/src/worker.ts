import { Decorator, parseFile } from '@swc/core'
import path from 'node:path'
import {
  Component,
  ComponentKind,
  ImportExtension,
  WorkerInput,
  WorkerOutput,
} from './shared.js'

module.exports = async (input: WorkerInput): Promise<WorkerOutput> => {
  const { sourceFile, outDir, importExtension } = input

  const module = await parseFile(sourceFile, {
    syntax: 'typescript',
    decorators: true,
  })

  const components: Component[] = []

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
            sourceFile,
            outDir,
            importExtension,
          })

          const importLine = `import { ${analyzeDecoratorsOutput.name} } from "${importPath}";`

          components.push({
            ...analyzeDecoratorsOutput,
            importLine,
          })
        }
      }
    }
  }

  return {
    components,
  }
}

interface ParseDecoratorsOutput {
  hasScannable: boolean
  hasController: boolean
  hasInjectable: boolean
}

const SCANNABLE_DECORATOR_NAME = 'Scannable'
const CONTROLLER_DECORATOR_NAME = 'Controller'
const INJECTABLE_DECORATOR_NAME = 'Injectable'

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
  sourceFile: string
  outDir: string
  importExtension: ImportExtension
}): string {
  const { sourceFile, outDir, importExtension } = input

  const relPath = path.relative(outDir, sourceFile)

  if (importExtension == null) {
    return relPath
  }

  const ext = path.extname(relPath)
  const withoutExt = relPath.slice(0, -ext.length)

  return `${withoutExt}${importExtension}`
}
