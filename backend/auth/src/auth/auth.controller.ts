import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { FourtyTwoAuthGuard } from './utils/fourty-two-auth-guard';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { JwtPayloadDto } from './dto/jwt-payload-dto';
import { Observable, of } from 'rxjs';
import { TokensDto } from './dto/tokens-dto';
import { CookieTokenDto } from './dto/cookie-token-dto';
import { CookieAndCookieNameDto } from './dto/cookie-and-cookie-name-dto';
import { UserIdNameLoginDto } from 'src/user/dto/user-id-name-login-dto';
import { DeleteRefreshTokenDto } from './dto/delete-refresh-token-dto';

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
    const accessCookie = this.authService.getCookieWithTokens({
      cookieName: this.configService.get('JWT_ACCESS_TOKEN_COOKIE_NAME'),
      token: tokens.jwtAccessToken,
      expirationTime: this.configService.get('JWT_ACCESS_EXPIRATION_TIME'),
    });
    const refreshCookie = this.authService.getCookieWithTokens({
      cookieName: this.configService.get('JWT_REFRESH_TOKEN_COOKIE_NAME'),
      token: tokens.jwtRefreshToken,
      expirationTime: this.configService.get('JWT_REFRESH_EXPIRATION_TIME'),
    });
    resp.setHeader('Set-Cookie', [accessCookie, refreshCookie]);
    return resp.redirect(302, this.configService.get('DASHBOARD_URL'));
  }

  // Jwt-token-related methods

  @MessagePattern('getTokens')
  getTokens(jwtPayloadDto: JwtPayloadDto): Observable<TokensDto> {
    console.log('auth-service controller got', jwtPayloadDto);
    return of(this.authService.generateJwtTokens(jwtPayloadDto));
  }

  @MessagePattern('getCookie')
  getCookieWithTokens(cookieTokenDto: CookieTokenDto): Observable<string> {
    return of(this.authService.getCookieWithTokens(cookieTokenDto));
  }

  @MessagePattern('getTokenFromCookies')
  extractTokenFromCookies(
    cookieAndCookieName: CookieAndCookieNameDto,
  ): Observable<string> {
    return of(this.authService.extractTokenFromCookies(cookieAndCookieName));
  }

  @MessagePattern('getUserByRefreshToken')
  async getUserByRefreshToken(
    refreshToken: string,
  ): Promise<Observable<UserIdNameLoginDto>> {
    return of(await this.authService.getUserByRefreshToken(refreshToken));
  }

  @EventPattern('deleteRefreshTokenFromDB')
  deleteRefreshTokenFromDB(deleteRefreshTokenDto: DeleteRefreshTokenDto): void {
    this.authService.deleteRefreshTokenFromDB(deleteRefreshTokenDto);
  }
}
