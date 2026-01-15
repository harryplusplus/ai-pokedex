import { Injectable, Logger } from '@nestjs/common'
import { AuthSignIn } from '@repo/common'
import { Scannable } from 'nest-component-scan'
import { v7 } from 'uuid'

import { DbService } from '../db/db.service.js'
import { GoogleAuthService } from '../google-auth/google-auth.service.js'
import { UserId } from '../user/user.schema.js'
import { toPrintable, toStack } from '../utils.js'
import { CreateAllOutput, JwtService } from './jwt.service.js'

@Scannable()
@Injectable()
export class AuthService {
  readonly #logger = new Logger(AuthService.name)

  constructor(
    private readonly googleAuthService: GoogleAuthService,
    private readonly dbService: DbService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(input: AuthSignIn): Promise<CreateAllOutput> {
    const { provider } = input

    const { providerUserId, name, image } =
      await this.#externalParseIdToken(input)

    return await this.dbService.transaction(async (client) => {
      const userId = await client.user.createOrGetId({
        provider,
        providerUserId,
      })

      const output = await this.jwtService.createAll({
        sub: userId,
        name,
        image,
      })

      await client.refreshToken.create({
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
    await this.dbService.client.refreshToken.revoke(refreshToken)
  }

  async refresh(refreshToken: string): Promise<CreateAllOutput | null> {
    return await this.dbService.transaction(async (client) => {
      const entity = await client.refreshToken.lock(refreshToken)
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

        await client.refreshToken.create({
          userId: UserId.parse(payload.sub),
          token: output.refreshToken,
          expiresAt: output.refreshTokenExpiresAt,
        })

        return output
      } finally {
        await client.refreshToken.revoke(refreshToken)
      }
    })
  }
}
