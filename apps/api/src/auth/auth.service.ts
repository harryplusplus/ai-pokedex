import { Injectable, Logger } from '@nestjs/common'
import { AuthSignIn } from '@repo/common'
import { Scannable } from 'nest-component-scan'
import { v7 } from 'uuid'

import { DbService } from '../db/db.service.js'
import { GoogleAuthService } from '../google-auth/google-auth.service.js'
import { RefreshTokenRepoFactory } from '../refresh-token/refresh-token.repo-factory.js'
import { UserRepoFactory } from '../user/user.repo-factory.js'
import { UserId } from '../user/user.schema.js'
import { toPrintable, toStack } from '../utils.js'
import { CreateAllOutput, JwtService } from './jwt.service.js'

@Scannable()
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

  async signIn(input: AuthSignIn): Promise<CreateAllOutput> {
    const { provider } = input

    const { providerUserId, name, image } =
      await this.#externalParseIdToken(input)

    return await this.dbService.transaction(async (sql) => {
      const userRepo = this.userRepoFactory.create(sql)

      const userId = await userRepo.createOrGetId({
        provider,
        providerUserId,
      })

      const output = await this.jwtService.createAll({
        sub: userId,
        name,
        image,
      })

      const refreshTokenRepo = this.refreshTokenRepoFactory.create(client)

      await refreshTokenRepo.create({
        userId,
        token: output.refreshToken,
        expiresAt: output.refreshTokenExpiresAt,
      })

      return output
    })
  }

  async #externalParseIdToken(
    input: AuthSignIn,
  ): Promise<{ providerUserId: string; name?: string; image?: string }> {
    const { provider, idToken } = input

    try {
      if (provider === 'google') {
        const { sub, name, picture } =
          await this.googleAuthService.externalParseIdToken(idToken)

        return {
          providerUserId: sub,
          name,
          image: picture,
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

  async signOut(refreshToken: string) {
    const refreshTokenRepo = this.refreshTokenRepoFactory.create(
      this.dbService.sql,
    )

    await refreshTokenRepo.revoke(refreshToken)
  }

  async refresh(refreshToken: string): Promise<CreateAllOutput | null> {
    return await this.dbService.transaction(async (sql) => {
      const refreshTokenRepo = this.refreshTokenRepoFactory.create(sql)

      const entity = await refreshTokenRepo.lock(refreshToken)
      if (!entity) {
        return null
      }

      try {
        if (new Date(entity.expiresAt) <= new Date()) {
          return null
        }

        const payload = await this.jwtService.validate(refreshToken)
        if (!payload) {
          return null
        }

        const output = await this.jwtService.createAll(payload)

        await refreshTokenRepo.create({
          userId: UserId.parse(payload.sub),
          token: output.refreshToken,
          expiresAt: output.refreshTokenExpiresAt,
        })

        return output
      } finally {
        await refreshTokenRepo.revoke(refreshToken)
      }
    })
  }
}
