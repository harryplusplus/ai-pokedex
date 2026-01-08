import { Module } from '@nestjs/common'
import { RefreshTokenRepoFactory } from './refresh-token.repo-factory.js'

@Module({
  providers: [RefreshTokenRepoFactory],
  exports: [RefreshTokenRepoFactory],
})
export class RefreshTokenModule {}
