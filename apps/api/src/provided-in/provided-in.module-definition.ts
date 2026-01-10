import { ConfigurableModuleBuilder } from '@nestjs/common'
import { Registry } from './registry.js'

export interface ProvidedInModuleOptions {
  registry?: Registry
}

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<ProvidedInModuleOptions>().build()
