import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { FourtyTwoAuthGuard } from './utils/fourty-two-auth-guard';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { JwtPayloadDto } from './dto/jwt-payload-dto';
import { Observable, of } from 'rxjs';
import { TokensDto } from './dto/tokens-dto';
import { UserIdNameLoginDto } from 'src/user/dto/user-id-name-login-dto';
import { DeleteRefreshTokenDto } from './dto/delete-refresh-token-dto';
import { TfaAuthGuard } from './utils/tfa-auth-guard';
import { GetUserId } from './utils/get-user-id.decorator';

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
	  if (await this.authService.isTfaEnabled(req.user.user_id)) {
		const userIdCookie = `userId=${req.user.user_id}; Path=/; HttpOnly; Max-Age=${this.configService.get('JWT_REFRESH_EXPIRATION_TIME')}`; // do the lax thing
		resp.setHeader('Set-Cookie', [userIdCookie]);
      // redirect for TFA
      return resp.redirect(302, this.configService.get('2FA_URL'));
    } else {
      // set jwt tokens in cookies and redirect to dashboard
      resp = this.authService.addCookiesToResponse(resp, req.user);
      return resp.redirect(302, this.configService.get('DASHBOARD_URL'));
    }
  }

  // FOR TESTING ONLY
  // Logs in as a TestUser. This route '...:3003/auth/testuser' is not protected by the 42 AuthGuard.
  // This allows one person to be testing with two users (the TestUser and own 42 account) on two computers / in two browsers
  // @Get('/testuser')
  // async loginTestUser(@Res() resp: Response) {
  //   const user = await this.authService.validateUserOrAddNewOne({
  //     intraLogin: 'TestUser',
  //     avatarUrl: 'default',
  //   });
  //   if (user) {
  //     resp = this.authService.addCookiesToResponse(resp, user);
  //     return resp.redirect(302, this.configService.get('DASHBOARD_URL'));
  //   } else {
  //     console.log('Something went wrong with logging in the TestUser');
  //     resp.status(500).send();
  //   }
  // }

  @UseGuards(TfaAuthGuard)
  @Post('tfa/authenticate')
  async handleTfa(
    @Res() resp: Response,
    @GetUserId() userId: string,
  ): Promise<Response> {
    const user = await this.authService.getUser(userId);
    // set jwt tokens in cookies and redirect to dashboard
    resp = this.authService.addCookiesToResponse(resp, user);
    return resp.status(200).send();
  }

  // Jwt-token-related methods

  @MessagePattern('getTokens')
  getTokens(jwtPayloadDto: JwtPayloadDto): Observable<TokensDto> {
    try {
      const result = this.authService.generateJwtTokens(jwtPayloadDto);
      return of(result);
    } catch (error) {
      throw error;
    }
  }

  @MessagePattern('getUserByRefreshToken')
  async getUserByRefreshToken(
    refreshToken: string,
  ): Promise<Observable<UserIdNameLoginDto>> {
    try {
      const result = await this.authService.getUserByRefreshToken(refreshToken);
      return of(result);
    } catch (error) {
      throw error;
    }
  }

  @EventPattern('deleteRefreshTokenFromDB')
  deleteRefreshTokenFromDB(deleteRefreshTokenDto: DeleteRefreshTokenDto): void {
    this.authService.deleteRefreshTokenFromDB(deleteRefreshTokenDto);
  }
}
