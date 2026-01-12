import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common'
import { StandardSchemaV1 } from '@standard-schema/spec'
import { Observable } from 'rxjs'
import { mergeMap } from 'rxjs/operators'

export class StandardSchemaInterceptor<
  T extends StandardSchemaV1,
> implements NestInterceptor<
  StandardSchemaV1.InferInput<T>,
  StandardSchemaV1.InferOutput<T>
> {
  constructor(private readonly schema: T) {}

  intercept(
    _: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardSchemaV1.InferOutput<T>> {
    return next.handle().pipe(
      mergeMap(async (data) => {
        return await this.schema['~standard'].validate(data)
      }),
    )
  }
}
