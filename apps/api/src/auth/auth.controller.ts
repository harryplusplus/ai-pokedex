import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common'
import type { Request, Response } from 'express'
import { ProvidedIn } from '../provided-in/provided-in.decorator.js'
import { RefreshTokenCookieHelper } from '../refresh-token/refresh-token-cookie.helper.js'
import { ZodOutputInterceptor } from '../zod-output.interceptor.js'
import { ZodPipe } from '../zod.pipe.js'
import {
  AuthRefreshOutput,
  AuthSignIn,
  AuthSignInOutput,
} from './auth.schema.js'
import { AuthService } from './auth.service.js'

@ProvidedIn()
@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly refreshTokenCookieHelper: RefreshTokenCookieHelper,
  ) {}

  @Post('/signIn')
  @UseInterceptors(new ZodOutputInterceptor(AuthSignInOutput))
  async signIn(
    @Body(new ZodPipe(AuthSignIn)) input: AuthSignIn,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSignInOutput> {
    const output = await this.authService.signIn(input)
    this.refreshTokenCookieHelper.setCookie(res, output)

    return output
  }

  @Post('/signOut')
  @HttpCode(204)
  async signOut(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    try {
      const refreshToken = this.refreshTokenCookieHelper.getCookie(req)
      if (refreshToken) {
        await this.authService.signOut(refreshToken)
      }
    } finally {
      this.refreshTokenCookieHelper.clearCookie(res)
    }
  }

  @Post('/refresh')
  @UseInterceptors(new ZodOutputInterceptor(AuthRefreshOutput))
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthRefreshOutput> {
    try {
      const refreshToken = this.refreshTokenCookieHelper.getCookie(req)
      if (!refreshToken) {
        throw new UnauthorizedException('Invalid token.')
      }

      const output = await this.authService.refresh(refreshToken)
      if (!output) {
        throw new UnauthorizedException('Invalid token.')
      }

      this.refreshTokenCookieHelper.setCookie(res, output)

      return output
    } catch (e) {
      this.refreshTokenCookieHelper.clearCookie(res)

      throw e
    }
  }
}
