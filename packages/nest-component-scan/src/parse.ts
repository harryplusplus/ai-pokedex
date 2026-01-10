import { parseFile } from '@swc/core'

export interface ParseOutput {
  path: string
  controllerNames: string[]
  injectableNames: string[]
}

export async function parse(path: string): Promise<ParseOutput> {
  const module = await parseFile(path, {
    syntax: 'typescript',
    decorators: true,
  })

  const controllerNames: string[] = []
  const injectableNames: string[] = []

  for (const moduleItem of module.body) {
    if (moduleItem.type === 'ExportDeclaration') {
      const { declaration } = moduleItem

      if (declaration.type === 'ClassDeclaration') {
        const { decorators = [] } = declaration

        let isScannable = false
        let isController = false
        let isInjectable = false
        for (const decorator of decorators) {
          const { expression } = decorator

          if (expression.type === 'CallExpression') {
            const { callee } = expression

            if (callee.type === 'Identifier') {
              if (callee.value === 'Scannable') {
                isScannable = true
              } else if (callee.value === 'Controller') {
                isController = true
              } else if (callee.value === 'Injectable') {
                isInjectable = true
              }
            }
          }
        }

        if (isScannable) {
          const className = declaration.identifier.value

          if (isController && isInjectable) {
            // TODO: error handling
          } else if (isController) {
            controllerNames.push(className)
          } else if (isInjectable) {
            injectableNames.push(className)
          }
        }
      }
    }
  }

  controllerNames.sort()
  injectableNames.sort()

  return {
    path,
    controllerNames,
    injectableNames,
  }
}
