import { Injectable } from '@nestjs/common'
import { JwtService as NestJwtService } from '@nestjs/jwt'
import { addDays, addMinutes } from 'date-fns'
import { v4 } from 'uuid'
import { ConfigService } from '../config/config.service.js'
import { JWT_ISSUER } from '../constants.js'
import { UserId } from '../user/user.schema.js'

@Injectable()
export class JwtService {
  constructor(
    private readonly nestJwtService: NestJwtService,
    private readonly configService: ConfigService,
  ) {}

  createAccessTokenExpiresAt(now: Date): Date {
    return addMinutes(now, 15)
  }

  createRefreshTokenExpiresAt(now: Date): Date {
    return addDays(now, 14)
  }

  async createToken(input: {
    userId: UserId
    now: Date
    expiresAt: Date
  }): Promise<string> {
    const { userId, now, expiresAt } = input

    const iat = Math.floor(now.getTime() / 1000)
    const exp = Math.floor(expiresAt.getTime() / 1000)

    return await this.nestJwtService.signAsync(
      {
        iss: JWT_ISSUER,
        aud: JWT_ISSUER,
        sub: userId,
        jti: v4(),
        iat,
        exp,
      },
      {
        secret: this.configService.jwtSecret,
        algorithm: 'HS256',
      },
    )
  }
}
