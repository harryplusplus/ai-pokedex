/* eslint-disable @typescript-eslint/no-explicit-any */

import { UseInterceptors } from '@nestjs/common'
import { StandardSchemaV1 } from '@standard-schema/spec'

import { StandardSchemaInterceptor } from './standard-schema.interceptor.js'

export type StandardSchemaHandler<F, T extends StandardSchemaV1> = F extends (
  ...args: any[]
) => infer Return
  ? Return extends Promise<any>
    ? (...args: any) => Promise<StandardSchemaV1.InferOutput<T>>
    : (...args: any) => StandardSchemaV1.InferOutput<T>
  : never

export function UseStandardSchemaInterceptor<T extends StandardSchemaV1>(
  schema: T,
) {
  return UseInterceptors(new StandardSchemaInterceptor(schema)) as <
    Target extends object,
    PropertyKey extends keyof Target,
  >(
    target: Target,
    propertyKey: PropertyKey,
    descriptor: TypedPropertyDescriptor<
      StandardSchemaHandler<Target[PropertyKey], T>
    >,
  ) => void
}
