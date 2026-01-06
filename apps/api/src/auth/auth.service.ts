import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AuthSignIn } from './auth.schema.js'

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  signIn(input: AuthSignIn): Promise<void> {
    const { idToken } = input
    // console.log(parsed)
    throw new Error()
    // parse idToken
    // this.googleAuthService.verifyIdToken(idToken)
  }
}
