import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { AuthService } from './auth.service.js'

@Module({
  imports: [JwtModule.register({})],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
