import { Injectable, Logger } from '@nestjs/common'
import { v7 } from 'uuid'
import { DbService } from '../db/db.service.js'
import { GoogleAuthService } from '../google-auth/google-auth.service.js'
import { RefreshTokenRepoFactory } from '../refresh-token/refresh-token.repo-factory.js'
import { UserRepoFactory } from '../user/user.repo-factory.js'
import { toPrintable, toStack } from '../utils.js'
import { AuthSignIn } from './auth.schema.js'
import { JwtService } from './jwt.service.js'

@Injectable()
export class AuthService {
  readonly #logger = new Logger(AuthService.name)

  constructor(
    private readonly googleAuthService: GoogleAuthService,
    private readonly userRepoFactory: UserRepoFactory,
    private readonly dbService: DbService,
    private readonly refreshTokenRepoFactory: RefreshTokenRepoFactory,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(input: AuthSignIn): Promise<{
    accessToken: string
    refreshToken: string
    refreshTokenExpiresAt: Date
  }> {
    const { provider } = input

    const providerUserId = await this.#parseProviderUserId(input)

    const userRepo = this.userRepoFactory.newRepo(this.dbService.sql)
    const userId = await userRepo.createOrGetId({
      provider,
      providerUserId,
    })

    const now = new Date()
    const accessToken = await this.jwtService.createToken({
      userId,
      now,
      expiresAt: this.jwtService.createAccessTokenExpiresAt(now),
    })

    const refreshTokenExpiresAt =
      this.jwtService.createRefreshTokenExpiresAt(now)
    const refreshToken = await this.jwtService.createToken({
      userId,
      now,
      expiresAt: refreshTokenExpiresAt,
    })

    const refreshTokenRepo = this.refreshTokenRepoFactory.newRepo(
      this.dbService.sql,
    )
    await refreshTokenRepo.create({
      userId,
      token: refreshToken,
      expiresAt: refreshTokenExpiresAt,
    })

    return {
      accessToken,
      refreshToken,
      refreshTokenExpiresAt,
    }
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
          toStack(e),
        )
      }

      throw new Error(`Invalid sign in input. logId: ${logId}.`)
    }
  }
}
