import { Injectable } from '@nestjs/common'
import { OAuth2Client } from 'google-auth-library'
import { Scannable } from 'nest-component-scan'

import { GOOGLE_CLIENT_ID } from '../constants.js'

@Scannable()
@Injectable()
export class GoogleAuthService {
  readonly #client: OAuth2Client

  constructor() {
    this.#client = new OAuth2Client({
      client_id: GOOGLE_CLIENT_ID,
    })
  }

  async externalParseIdToken(
    idToken: string,
  ): Promise<{ sub: string; name?: string; picture?: string }> {
    const loginTicket = await this.#client.verifyIdToken({
      idToken,
    })

    const { sub, name, picture } = loginTicket.getPayload() ?? {}
    if (!sub) {
      throw new Error('Invalid id token.')
    }

    return {
      sub,
      name,
      picture,
    }
  }
}
