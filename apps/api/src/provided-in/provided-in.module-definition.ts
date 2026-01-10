import { ConfigurableModuleBuilder } from '@nestjs/common'
import { getGlobalRegistry } from './global.registry.js'
import { Registry } from './registry.js'

export interface ProvidedInModuleOptions {
  registry?: Registry
}

export function resolveProvidedInModuleOptions(
  options?: ProvidedInModuleOptions,
): Required<ProvidedInModuleOptions> {
  return {
    registry: options?.registry ?? getGlobalRegistry(),
  }
}

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<ProvidedInModuleOptions>().build()
