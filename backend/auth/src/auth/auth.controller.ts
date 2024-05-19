import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { FourtyTwoAuthGuard } from './utils/fourty-two-auth-guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './utils/jwt-auth-guard';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}
  @UseGuards(FourtyTwoAuthGuard)
  @Get('42/login')
  async handleLogin() {}

  @UseGuards(FourtyTwoAuthGuard)
  @Get('42/redirect')
  handleRedirect(@Req() req, @Res() resp: Response): void {
    const tokens = this.authService.login(req.user);
    // setting the jwt tokens in cookies
    const accessCookie = this.authService.getCookieWithTokens(
      this.configService.get('JWT_ACCESS_TOKEN_COOKIE_NAME'),
      tokens.jwtAccessToken,
      this.configService.get('JWT_ACCESS_EXPIRATION_TIME'),
    );
    const refreshCookie = this.authService.getCookieWithTokens(
      this.configService.get('JWT_REFRESH_TOKEN_COOKIE_NAME'),
      tokens.jwtRefreshToken,
      this.configService.get('JWT_REFRESH_EXPIRATION_TIME'),
    );
    resp.setHeader('Set-Cookie', [accessCookie, refreshCookie]);
    return resp.redirect(302, this.configService.get('DASHBOARD_URL'));
  }

  // a uuid verification of userId is needed here
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req, @Res() resp: Response, @Body() userId: string): Response {
    resp.clearCookie(this.configService.get('JWT_ACCESS_TOKEN_COOKIE_NAME'));
    resp.clearCookie(this.configService.get('JWT_REFRESH_TOKEN_COOKIE_NAME'));
    this.authService.deleteRefreshTokenFromDB({ userId: userId });
    return resp.sendStatus(200);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
	return 'You got this!';
    // return req.user;
  }
}

/**
 * This is how the TWO cookies will look like after login:
 * Authentication=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjM2RiODgxYy1mZTI3LTQzMDAtYjVmOC0zNjEzNGQ4OTE4ZTQiLCJ1c2VyX25hbWUiOiJ3aWxkX3RoaW5nIiwiaW50cmFfbG9naW4iOiJkbWFsYWNvdiIsImlhdCI6MTcxNTYzMTUyNywiZXhwIjoxNzE1NjMxNTMwfQ.vpseAjt1nklrZgYXIHKfAE_2Y-qwbLUprEnC-ADauuU; Path=/; Expires=Mon, 13 May 2024 20:18:51 GMT; Secure
 *
 * Refresh=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjM2RiODgxYy1mZTI3LTQzMDAtYjVmOC0zNjEzNGQ4OTE4ZTQiLCJpYXQiOjE3MTU2MzE1MjcsImV4cCI6MTcxNTYzMTYxM30.0ocTzIgGOM7BzXBEwD3DOxAFiF-3popkp9_t6aPyMIE; Path=/; Expires=Mon, 13 May 2024 20:20:14 GMT; HttpOnly; Secure
 *
 * and after logout:
 * Authentication=; Path=/; secure=true; Max-Age=0
 * Refresh=; Path=/; secure=true; Max-Age=0
 */
