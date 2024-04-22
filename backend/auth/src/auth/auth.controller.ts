import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
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
    console.log('In handleRedirect()');
    console.log('REQUEST');
    console.log(req);
    const cookie = this.authService.login({
      user_name: req.user.user_name,
      sub: req.user.user_id,
      intra_login: req.user.intra_login,
    });
    resp.setHeader('Set-Cookie', cookie);
    return resp.redirect(302, this.configService.get('DASHBOARD_URL'));
  }

  // CREATE ROUTE 42/REFRESH

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }
}
