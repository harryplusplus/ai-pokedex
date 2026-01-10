import { DynamicModule, Module } from '@nestjs/common'
import { isController, isInjectable } from './nest.helper.js'
import {
  ConfigurableModuleClass,
  resolveProvidedInModuleOptions,
} from './provided-in.module-definition.js'

export type RegisterOptions = Parameters<
  (typeof ConfigurableModuleClass)['register']
>[0]

@Module({})
export class ProvidedInModule extends ConfigurableModuleClass {
  static register(options: RegisterOptions = {}): DynamicModule {
    const { registry } = resolveProvidedInModuleOptions(options)

    const controllers = []
    const providers = []
    for (const metatype of registry.values()) {
      if (isController(metatype)) {
        controllers.push(metatype)
      } else if (isInjectable(metatype)) {
        providers.push(metatype)
      }
    }

    const dynamicModule = super.register(options)

    return {
      ...dynamicModule,
      controllers: [...(dynamicModule.controllers ?? []), ...controllers],
      providers: [...(dynamicModule.providers ?? []), ...providers],
      exports: [...(dynamicModule.exports ?? []), ...controllers, ...providers],
    }
  }
}
