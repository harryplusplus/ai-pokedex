import { Injectable } from '@nestjs/common'
import { JwtService as NestJwtService } from '@nestjs/jwt'
import { addDays, addMinutes } from 'date-fns'
import { v4 } from 'uuid'
import { Scannable } from '../component-scan/scannable.decorator.js'
import { ConfigService } from '../config/config.service.js'
import { JWT_ISSUER } from '../constants.js'

interface JwtPayload {
  sub: string
  name?: string
  image?: string
}

export interface CreateAllOutput {
  accessToken: string
  refreshToken: string
  refreshTokenExpiresAt: Date
}

@Scannable()
@Injectable()
export class JwtService {
  readonly #secrets: string[]

  constructor(
    private readonly nestJwtService: NestJwtService,
    private readonly configService: ConfigService,
  ) {
    this.#secrets = [configService.jwtSecret, ...configService.jwtSecretOlds]
  }

  #createAccessTokenExpiresAt(now: Date): Date {
    return addMinutes(now, 15)
  }

  #createRefreshTokenExpiresAt(now: Date): Date {
    return addDays(now, 1)
  }

  async #createToken(
    input: JwtPayload & {
      now: Date
      expiresAt: Date
    },
  ): Promise<string> {
    const { sub, now, expiresAt, name, image } = input

    const iat = Math.floor(now.getTime() / 1000)
    const exp = Math.floor(expiresAt.getTime() / 1000)

    const payload: Record<string, unknown> = {
      iss: JWT_ISSUER,
      aud: JWT_ISSUER,
      sub,
      jti: v4(),
      iat,
      exp,
    }

    if (name) {
      payload['name'] = name
    }

    if (image) {
      payload['image'] = image
    }

    return await this.nestJwtService.signAsync(payload, {
      secret: this.configService.jwtSecret,
      algorithm: 'HS256',
    })
  }

  async validate(token: string): Promise<JwtPayload | null> {
    for (const secret of this.#secrets) {
      try {
        const payload = await this.nestJwtService.verifyAsync<JwtPayload>(
          token,
          {
            algorithms: ['HS256'],
            secret,
          },
        )

        return payload
      } catch (_e) {
        continue
      }
    }

    return null
  }

  async createAll(input: JwtPayload): Promise<CreateAllOutput> {
    const now = new Date()
    const accessToken = await this.#createToken({
      ...input,
      now,
      expiresAt: this.#createAccessTokenExpiresAt(now),
    })

    const refreshTokenExpiresAt = this.#createRefreshTokenExpiresAt(now)
    const refreshToken = await this.#createToken({
      ...input,
      now,
      expiresAt: refreshTokenExpiresAt,
    })

    return {
      accessToken,
      refreshToken,
      refreshTokenExpiresAt,
    }
  }
}
