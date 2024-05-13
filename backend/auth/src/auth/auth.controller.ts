import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { FourtyTwoAuthGuard } from './utils/fourty-two-auth-guard';
import { AuthService } from './auth.service';
import { JwtAccessAuthGuard } from './utils/jwt-access-auth-guard';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtRefreshAuthGuard } from './utils/jwt-refresh-auth-guard';

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
    const { jwtAccessToken, jwtRefreshToken } = this.authService.login(
      req.user,
    );
    // setting the jwt tokens in cookies
    resp.cookie('Authentication', jwtAccessToken, {
      path: '/',
      secure: true,
      expires: new Date(
        Date.now() +
          Number(this.configService.get('JWT_ACCESS_EXPIRATION_TIME')),
      ),
      httpOnly: false,
    });
    resp.cookie('Refresh', jwtRefreshToken, {
      path: '/',
      secure: true,
      expires: new Date(
        Date.now() +
          Number(this.configService.get('JWT_REFRESH_EXPIRATION_TIME')),
      ),
      httpOnly: true,
    });
    return resp.redirect(302, this.configService.get('DASHBOARD_URL'));
  }

  @UseGuards(JwtRefreshAuthGuard)
  //   @Post('/refresh')
  @Get('/refresh') // this is just for testing from browser, otherwise this method should be POST
  refreshJwtToken(@Req() req, @Res() resp: Response) {
    // generating new set of jwt tokens
    const jwtAccessToken = this.authService.generateJwtAccessToken({
      sub: req.user.user_id,
      user_name: req.user_name,
      intra_login: req.intra_login,
    });
    const jwtRefreshToken = this.authService.generateJwtRefreshToken(
      req.user.user_id,
    );
    // setting the jwt tokens in cookies
    resp.cookie('Authentication', jwtAccessToken, {
      path: '/',
      secure: true,
      expires: new Date(
        Date.now() +
          Number(this.configService.get('JWT_ACCESS_EXPIRATION_TIME')),
      ),
      httpOnly: false,
    });
    resp.cookie('Refresh', jwtRefreshToken, {
      path: '/',
      secure: true,
      expires: new Date(
        Date.now() +
          Number(this.configService.get('JWT_REFRESH_EXPIRATION_TIME')),
      ),
      httpOnly: true,
    });
    resp.send();
  }

  @UseGuards(JwtAccessAuthGuard)
  @Post('logout')
  logout(@Req() req, @Res() resp: Response): Response {
    resp.clearCookie('Authentication');
    resp.clearCookie('Refresh');
    return resp.sendStatus(200);
  }

  @UseGuards(JwtAccessAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }

  // FOR TESTING TOKEN REFRESHING
  @Get('/simulate')
  async simulate(@Req() req, @Res() resp: Response) {
    resp.redirect('http://localhost:3003/auth/refresh');
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
