import { Injectable, Logger } from '@nestjs/common'
import { v7 } from 'uuid'
import { DbService } from '../db/db.service.js'
import { GoogleAuthService } from '../google-auth/google-auth.service.js'
import { RefreshTokenService } from '../refresh-token/refresh-token.service.js'
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
  ) {}

  async signIn(input: AuthSignIn): Promise<void> {
    const { provider } = input

    const providerUserId = await this.#parseProviderUserId(input)

    const result = await this.dbService.sql.begin(async (sql) => {
      const userRepo = this.userService.createRepo(sql)

      const user = await userRepo.signIn({
        provider,
        providerUserId,
      })

      const refreshTokenRepo = this.refreshTokenService.createRepo(sql)
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
}
