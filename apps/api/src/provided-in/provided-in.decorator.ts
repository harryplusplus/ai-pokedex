import { Type } from '@nestjs/common'
import { getGlobalRegistry } from './global.registry.js'
import { Registry } from './registry.js'

export interface ProvidedInOptions {
  registry?: Registry
}

function resolveProvidedInOptions(
  options?: ProvidedInOptions,
): Required<ProvidedInOptions> {
  return {
    registry: options?.registry ?? getGlobalRegistry(),
  }
}

export function ProvidedIn(options?: ProvidedInOptions): ClassDecorator {
  const decorator: ClassDecorator = (target) => {
    const { registry } = resolveProvidedInOptions(options)

    registry.add(target as unknown as Type)
  }

  return decorator
}
