import { UseInterceptors } from '@nestjs/common'
import z, { ZodType } from 'zod'

import { ZodOutputInterceptor } from './zod-output.interceptor.js'

type ZodOutputHandler<F, T extends ZodType> = F extends (
  ...args: infer Args
) => infer Return
  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Return extends Promise<any>
    ? (...args: Args) => Promise<z.infer<T>>
    : (...args: Args) => z.infer<T>
  : never

export function ZodOutputHandler<T extends ZodType>(schema: T) {
  return UseInterceptors(new ZodOutputInterceptor(schema)) as <
    // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
    Target extends Object,
    PropertyKey extends keyof Target,
  >(
    target: Target,
    propertyKey: PropertyKey,
    descriptor: TypedPropertyDescriptor<
      ZodOutputHandler<Target[PropertyKey], T>
    >,
  ) => void
}
