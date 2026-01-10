import {
  DynamicModule,
  Logger,
  Module,
  ModuleMetadata,
  Type,
} from '@nestjs/common'
import { Glob, GlobOptions } from 'glob'
import { pathToFileURL } from 'node:url'
import { isController, isInjectable, isScannable } from './helpers.js'

type Ignore = NonNullable<GlobOptions['ignore']>

export interface ComponentScanModuleOptions {
  pattern: string | string[]
  ignore?: Ignore
  imports?: ModuleMetadata['imports']
}

@Module({})
export class ComponentScanModule {
  private static logger = new Logger(ComponentScanModule.name)

  static async forRoot(
    options: ComponentScanModuleOptions,
  ): Promise<DynamicModule> {
    const { pattern, ignore, imports } = options

    const glob = new Glob(pattern, { ignore })

    const modulePromises = []
    for (const path of glob) {
      const fileUrl = pathToFileURL(path).href
      modulePromises.push(import(fileUrl))
    }

    const modules = await Promise.all(modulePromises)

    const controllers: Type[] = []
    const providers: Type[] = []
    modules.forEach((mod) => {
      Object.values(mod as object).forEach((value) => {
        if (typeof value === 'function') {
          const metatype = value as Type
          if (isScannable(metatype)) {
            if (isController(metatype)) {
              controllers.push(metatype)
            } else if (isInjectable(metatype)) {
              providers.push(metatype)
            }
          }
        }
      })
    })

    const loadedComponents = [
      ...controllers.map((x) => x.name),
      ...providers.map((x) => x.name),
    ]
    loadedComponents.sort()
    this.logger.log(`Loaded components: ${loadedComponents.join(', ')}.`)

    return {
      module: this,
      imports,
      controllers,
      providers,
      exports: providers,
    }
  }
}
