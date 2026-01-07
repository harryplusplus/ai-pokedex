import { Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { v7 } from 'uuid'
import { ConfigService } from '../config/config.service.js'
import { DbService } from '../db/db.service.js'
import { GoogleAuthService } from '../google-auth/google-auth.service.js'
import { RefreshTokenService } from '../refresh-token/refresh-token.service.js'
import { UserId } from '../user/user.schema.js'
import { UserService } from '../user/user.service.js'
import { toPrintable } from '../utils.js'
import { AuthSignIn } from './auth.schema.js'

@Injectable()
export class AuthService {
  readonly #logger = new Logger(AuthService.name)

  constructor(
    private readonly googleAuthService: GoogleAuthService,
    private readonly userService: UserService,
    private readonly dbService: DbService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signIn(input: AuthSignIn): Promise<void> {
    const { provider } = input

    const providerUserId = await this.#parseProviderUserId(input)
    const a = await this.jwtService.signAsync({}, {})
    const result = await this.dbService.sql.begin(async (sql) => {
      const userRepo = this.userService.newRepo(sql)

      const user = await userRepo.signIn({
        provider,
        providerUserId,
      })

      const refreshTokenRepo = this.refreshTokenService.newRepo(sql)
    })
  }

  async #parseProviderUserId(input: AuthSignIn): Promise<string> {
    const { provider, idToken } = input

    try {
      if (provider === 'google') {
        const providerUserId =
          await this.googleAuthService.verifyIdToken(idToken)
        if (providerUserId) {
          return providerUserId
        }
      }

      throw new Error('Invalid sign in input.')
    } catch (e) {
      const logId = v7()
      if (process.env.NODE_ENV === 'development') {
        this.#logger.error(
          `Failed to parse id token. logId: ${logId}, provider: ${provider}, idToken: ${idToken}, error: ${toPrintable(e)}.`,
        )
      }

      throw new Error(`Invalid sign in input. logId: ${logId}.`)
    }
  }

  async #generateAccessToken(userId: UserId): Promise<string> {
    return await this.jwtService.signAsync(
      {},
      {
        secret: this.configService.jwtSecret,
        algorithm: 'HS256',
        expiresIn: '15m',
        subject: userId,
        audience: 'https://ai-pokedex.vercel.com',
      },
    )
  }

  async #generateRefreshToken(userId: UserId): Promise<string> {
    return await this.jwtService.signAsync(
      {},
      {
        secret: this.configService.jwtSecret,
        algorithm: 'HS256',
        expiresIn: '7d',
        subject: userId,
      },
    )
  }
}
