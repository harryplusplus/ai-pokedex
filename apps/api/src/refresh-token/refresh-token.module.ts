import { Module } from '@nestjs/common'
import { RefreshTokenCookieHelper } from './refresh-token-cookie.helper.js'
import { RefreshTokenRepoFactory } from './refresh-token.repo-factory.js'

@Module({
  providers: [RefreshTokenRepoFactory, RefreshTokenCookieHelper],
  exports: [RefreshTokenRepoFactory, RefreshTokenCookieHelper],
})
export class RefreshTokenModule {}
