import { Registry } from './registry.js'

const globalRegistry = new Registry()

export function getGlobalRegistry(): Registry {
  return globalRegistry
}
