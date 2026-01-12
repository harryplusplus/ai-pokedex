import type { ArgumentMetadata, PipeTransform } from '@nestjs/common'
import type { StandardSchemaV1 } from '@standard-schema/spec'

export class StandardSchemaPipe<
  T extends StandardSchemaV1,
> implements PipeTransform {
  constructor(private readonly schema: T) {}

  async transform(
    value: StandardSchemaV1.InferInput<T>,
    metadata: ArgumentMetadata,
  ): Promise<StandardSchemaV1.InferOutput<T>> {
    if (metadata.data) {
      throw new Error('Invalid pipe metadata.')
    }

    return await this.schema['~standard'].validate(value)
  }
}
