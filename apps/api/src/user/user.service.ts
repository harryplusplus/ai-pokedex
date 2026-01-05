import { Injectable } from '@nestjs/common'
import { AuthService } from '../auth/auth.service.js'
import { GoogleAuthService } from '../google-auth/google-auth.service.js'
import { UserSignIn } from './user.schema.js'

@Injectable()
export class UserService {
  constructor(
    private readonly authService: AuthService,
    private readonly googleAuthService: GoogleAuthService,
  ) {}

  signIn(input: UserSignIn): Promise<void> {
    const { idToken } = input
    const parsed = this.authService.decodeJwt(idToken)
    console.log(parsed)
    throw new Error()
    // parse idToken
    // this.googleAuthService.verifyIdToken(idToken)
  }
}
