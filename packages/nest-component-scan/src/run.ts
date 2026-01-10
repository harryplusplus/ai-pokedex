import { Glob } from 'glob'
import fs from 'node:fs'
import path from 'node:path'
import { parse, ParseOutput } from './parse'

export type Ignore = NonNullable<
  ConstructorParameters<typeof Glob>[1]['ignore']
>

export type Extension =
  | ''
  | '.js'
  | '.cjs'
  | '.mjs'
  | '.ts'
  | '.cts'
  | '.mts'
  | null

export interface RunOptions {
  glob: {
    pattern: string | string[]
    ignore?: Ignore
  }
  outputPath?: string
  transformExtension?: Extension
}

export async function run(options: RunOptions) {
  const {
    glob,
    outputPath = './src/generated/nest-component-scan.ts',
    transformExtension = '.js',
  } = options

  const { pattern, ignore } = glob
  const globInst = new Glob(pattern, {
    ignore,
  })

  const parsePromises: Promise<ParseOutput>[] = []

  for await (const file of globInst.iterate()) {
    parsePromises.push(parse(file))
  }

  const parseOutputs = await Promise.all(parsePromises)
  parseOutputs.sort((a, b) => a.path.localeCompare(b.path))

  const outputDir = path.dirname(outputPath)

  const controllerNames: string[] = []
  const injectableNames: string[] = []
  const lines: string[] = ['// ⚠️ AUTO-GENERATED FILE - DO NOT EDIT.', '']

  for (const output of parseOutputs) {
    lines.push(
      ...createImportLines({
        modulePath: output.path,
        classNames: output.controllerNames,
        outputDir,
        transformExtension,
      }),
    )

    controllerNames.push(...output.controllerNames)

    lines.push(
      ...createImportLines({
        modulePath: output.path,
        classNames: output.injectableNames,
        outputDir,
        transformExtension,
      }),
    )

    injectableNames.push(...output.injectableNames)
  }

  controllerNames.sort()
  injectableNames.sort()

  lines.push('')
  lines.push('export const SCANNED_CONTROLLERS = [')

  for (const controllerName of controllerNames) {
    lines.push(`  ${controllerName},`)
  }

  lines.push('];')
  lines.push('')
  lines.push('export const SCANNED_INJECTABLES = [')

  for (const injectableName of injectableNames) {
    lines.push(`  ${injectableName},`)
  }

  lines.push('];')

  await fs.promises.mkdir(outputDir, { recursive: true })
  await fs.promises.writeFile(outputPath, lines.join('\n'))
}

function createImportLines(input: {
  modulePath: string
  classNames: string[]
  outputDir: string
  transformExtension?: Extension
}) {
  const { modulePath, classNames, outputDir, transformExtension } = input

  const lines: string[] = []

  for (const className of classNames) {
    let relativePath = path.relative(outputDir, modulePath)

    if (transformExtension != null) {
      const ext = path.extname(relativePath)
      const withoutExt = relativePath.slice(0, -ext.length)
      relativePath = withoutExt + transformExtension
    }

    lines.push(`import { ${className} } from "${relativePath}";`)
  }

  return lines
}
