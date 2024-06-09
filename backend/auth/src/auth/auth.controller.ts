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
import { TfaAuthGuard } from './utils/tfa-auth-guard';
import { TwoFactorAuthDto } from 'src/tfa/dto/two-factor-auth-dto';

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
  async handleRedirect(@Req() req, @Res() resp: Response): Promise<void> {
    console.log('user is', req.user);
    if (await this.authService.isTfaEnabled(req.user.user_id)) {
      return resp.redirect(302, this.configService.get('2FA_URL'));
    } else {
      resp = this.authService.addCookiesToResponse(resp, req.user);
      return resp.redirect(302, this.configService.get('DASHBOARD_URL'));
    }
  }

  @UseGuards(TfaAuthGuard)
  @Post('tfa/authenticate')
  handleTfa(@Res() resp: Response, @Body() tfaDto: TwoFactorAuthDto) {
    const user = this.authService.getUser(tfaDto.userId);
    resp = this.authService.addCookiesToResponse(resp, user);
    return resp.redirect(302, this.configService.get('DASHBOARD_URL'));
  }

  // Jwt-token-related methods

  @MessagePattern('getTokens')
  getTokens(jwtPayloadDto: JwtPayloadDto): Observable<TokensDto> {
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
