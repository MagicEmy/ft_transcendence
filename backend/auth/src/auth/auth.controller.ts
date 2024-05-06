import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
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
    const cookie = this.authService.getCookieForLogin(req.user);
    resp.setHeader('Set-Cookie', cookie);
    return resp.redirect(302, this.configService.get('DASHBOARD_URL'));
  }

  // route auth/42/refresh

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req, @Res() resp: Response): Response {
    const cookie = this.authService.getCookieForLogout();
    resp.setHeader('Set-Cookie', cookie);
    return resp.sendStatus(200);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }
}

/**
 * This is how the cookie will look like after login:
 * Authentication=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5NzgzYTUxNy05ZDgzLTRhMjItOWEwZi01NTUxZGYyYTZmYWIiLCJ1c2VyX25hbWUiOiJkbWFsYWNvdiIsImludHJhX2xvZ2luIjoiZG1hbGFjb3YiLCJpYXQiOjE3MTQyMjgyMzksImV4cCI6MTcxNDIzMTgzOX0.vqq-Ua6EUe0PaJJEmYQkHvflKL7pA_9K0z03is5f0Lo; Refresh=101c1fab53cb354d0605cc126bd65124d4f8e12fc7759ca6f27f0cf9341ae15e HttpOnly; Path=/; secure=true; Max-Age=3600
 *
 * and after logout:
 * Authentication=; Refresh=; HttpOnly; Path=/; secure=true; Max-Age=0
 */
