import { Module } from '@nestjs/common'
import { TrpcModule } from '../trpc/trpc.module.js'
import { ApiKeyService } from './api-key.service.js'
import { ApiKeyTrpcProcedure } from './api-key.trpc-procedure.js'

@Module({
  imports: [TrpcModule],
  providers: [ApiKeyTrpcProcedure, ApiKeyService],
})
export class ApiKeyModule {}
