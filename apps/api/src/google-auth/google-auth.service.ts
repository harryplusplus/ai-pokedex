import { Injectable } from '@nestjs/common'
import { OAuth2Client } from 'google-auth-library'
import { GOOGLE_CLIENT_ID } from '../constants.js'

@Injectable()
export class GoogleAuthService {
  readonly #client: OAuth2Client

  constructor() {
    this.#client = new OAuth2Client({
      client_id: GOOGLE_CLIENT_ID,
    })
  }

  async verifyIdToken(idToken: string): Promise<string | null> {
    const loginTicket = await this.#client.verifyIdToken({
      idToken,
    })

    return loginTicket.getPayload()?.sub ?? null
  }
}
