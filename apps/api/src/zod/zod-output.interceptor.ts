import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { mergeMap } from 'rxjs/operators'
import z, { ZodType } from 'zod'

export class ZodOutputInterceptor<T extends ZodType> implements NestInterceptor<
  z.input<T>,
  z.infer<T>
> {
  constructor(private readonly schema: T) {}

  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<z.infer<T>> {
    return next.handle().pipe(
      mergeMap(async (data) => {
        return await this.schema.parseAsync(data)
      }),
    )
  }
}
