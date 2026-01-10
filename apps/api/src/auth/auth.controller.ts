import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common'
import { AccessTokenDto, AuthSignIn } from '@repo/common'
import type { Request, Response } from 'express'
import { Scannable } from '../component-scan/scannable.decorator.js'
import { RefreshTokenCookieHelper } from '../refresh-token/refresh-token-cookie.helper.js'
import { ZodOutputHandler } from '../zod/zod-output.handler.js'
import { ZodPipe } from '../zod/zod.pipe.js'
import { AuthService } from './auth.service.js'

@Scannable()
@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly refreshTokenCookieHelper: RefreshTokenCookieHelper,
  ) {}

  @Post('/signin')
  @ZodOutputHandler(AccessTokenDto)
  async signIn(
    @Body(new ZodPipe(AuthSignIn)) input: AuthSignIn,
    @Res({ passthrough: true }) res: Response,
  ) {
    const output = await this.authService.signIn(input)
    this.refreshTokenCookieHelper.setCookie(res, output)

    return {
      accessToken: output.accessToken,
    }
  }

  @Post('/signout')
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
  @ZodOutputHandler(AccessTokenDto)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
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

      return {
        accessToken: output.accessToken,
      }
    } catch (e) {
      this.refreshTokenCookieHelper.clearCookie(res)

      throw e
    }
  }
}
