import type { ArgumentMetadata, PipeTransform } from '@nestjs/common'
import z, { ZodType } from 'zod'

export class ZodPipe<T extends ZodType> implements PipeTransform<
  z.input<T>,
  Promise<z.infer<T>>
> {
  constructor(private readonly schema: T) {}

  async transform(
    value: z.input<T>,
    metadata: ArgumentMetadata,
  ): Promise<z.infer<T>> {
    if (metadata.type !== 'body' || metadata.data || metadata.metatype) {
      throw new Error('Invalid pipe metadata.')
    }

    return await this.schema.parseAsync(value)
  }
}
