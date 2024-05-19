import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenExpiredError } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import * as jwt from 'jsonwebtoken';
import { AuthService } from '../auth.service';
import { User } from 'src/user/user.entity';
import { Response } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = this.getRequest(context);
    const resp: Response = context.switchToHttp().getResponse();
    try {
      await super.canActivate(context);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        // explore validation with refresh token and get the user that the token belongs to
        const user = await this.activateWithRefreshToken(req);
        if (!user) {
          // token is missing, invalid, expired or has been destroyed
          throw new UnauthorizedException();
        }
        // generate new set of tokens and put them in the response
        const tokens = this.authService.generateJwtTokens({
          sub: user.user_id,
          user_name: user.user_name,
          intra_login: user.intra_login,
        });
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
      } else {
        throw new UnauthorizedException();
      }
    }
    return true;
  }

  handleRequest(err, user, info) {
    if (info instanceof TokenExpiredError) {
      throw info;
    } else if (!user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }

  async activateWithRefreshToken(req): Promise<User> | null {
    // extract the refresh token from cookies
    const refreshToken = this.extractRefreshTokenFromCookies(req);
    if (!refreshToken) {
      return null;
    }
    // validate the refresh token and get the user that the token belongs to
    return this.validateRefreshToken(
      refreshToken,
      this.configService.get('JWT_REFRESH_SECRET'),
    );
  }

  private extractRefreshTokenFromCookies(req): string | null {
    const cookies = req.get('cookie');
    let refreshCookieValue = null;
    if (cookies) {
      cookies.split(';').forEach((cookie) => {
        const [name, value] = cookie.trim().split('=');
        if (name === this.configService.get('JWT_REFRESH_TOKEN_COOKIE_NAME')) {
          refreshCookieValue = value;
        }
      });
    }
    return refreshCookieValue;
  }

  private async validateRefreshToken(
    refreshToken: string,
    secret: string,
  ): Promise<User> | null {
    try {
      jwt.verify(refreshToken, secret);
      const user = this.authService.getUserByRefreshToken(refreshToken);
      return user;
    } catch (error) {
      console.log(error);
      this.authService.deleteRefreshTokenFromDB({
        refreshToken: refreshToken,
      });
      return null;
    }
  }
}
