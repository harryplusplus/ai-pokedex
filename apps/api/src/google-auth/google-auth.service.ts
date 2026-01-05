import { Injectable } from '@nestjs/common'
import { OAuth2Client } from 'google-auth-library'
import { GOOGLE_CLIENT_ID } from './google-auth.constant.js'

@Injectable()
export class GoogleAuthService {
  readonly #client: OAuth2Client

  constructor() {
    this.#client = new OAuth2Client({
      client_id: GOOGLE_CLIENT_ID,
    })
  }

  async verifyIdToken(idToken: string): Promise<boolean> {
    const loginTicket = await this.#client.verifyIdToken({
      idToken,
    })
    console.log(loginTicket)
    return true
  }
}
