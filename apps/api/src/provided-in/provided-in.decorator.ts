import { Type } from '@nestjs/common'
import { getGlobalRegistry } from './global.registry.js'
import { Registry } from './registry.js'

export interface ProvidedInOptions {
  registry?: Registry
}

export function ProvidedIn(options?: ProvidedInOptions): ClassDecorator {
  const decorator: ClassDecorator = (target) => {
    const registry = options?.registry ?? getGlobalRegistry()
    registry.add(target as unknown as Type)
  }

  return decorator
}
