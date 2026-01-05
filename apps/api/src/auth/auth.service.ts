import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  decodeJwt(token: string): Record<string, unknown> {
    return this.jwtService.decode(token)
  }
}
