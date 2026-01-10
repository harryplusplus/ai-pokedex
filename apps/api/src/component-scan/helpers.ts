import type { Type } from '@nestjs/common'
import {
  CONTROLLER_WATERMARK,
  INJECTABLE_WATERMARK,
} from '@nestjs/common/constants.js'
import { SCANNABLE_WATERMARK } from './constants.js'

export function isInjectable(metatype: Type): boolean {
  return !!Reflect.getMetadata(INJECTABLE_WATERMARK, metatype)
}

export function isController(metatype: Type): boolean {
  return !!Reflect.getMetadata(CONTROLLER_WATERMARK, metatype)
}

export function isScannable(metatype: Type): boolean {
  return !!Reflect.getMetadata(SCANNABLE_WATERMARK, metatype)
}
