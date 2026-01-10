import { SCANNABLE_WATERMARK } from './constants.js'

export function Scannable(): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(SCANNABLE_WATERMARK, true, target)
  }
}
