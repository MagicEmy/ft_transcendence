import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenExpiredError } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Response } from 'express';
import {
  catchError,
  forkJoin,
  lastValueFrom,
  map,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { getCookieWithTokens, extractTokenFromCookies } from '../utils/cookie-utils';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private logger: Logger = new Logger(JwtAuthGuard.name);
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
        // verify whether the refresh token exists in the database
        const refreshToken: string = extractTokenFromCookies({
			cookie: req.get('cookie'),
			cookieName: this.configService.get(
			  'JWT_REFRESH_TOKEN_COOKIE_NAME',
			),
		  });
		const userDB = await lastValueFrom(this.authService
		.getUserByRefreshToken(refreshToken)
		.pipe(
			catchError((err) => {
				this.logger.error(`User not recognized`);
				return throwError(() => new UnauthorizedException(`User not recognized`));
			}
			),
		));
        if (!userDB || !refreshToken) {
          // token is missing, invalid, expired, has been destroyed or does not exist in the DB
          this.logger.error(`Refresh token not recognized`);
          throw new UnauthorizedException(`Refresh token not recognized`);
        } else {
          try {
            this.authService.validateRefreshToken(
              refreshToken,
              this.configService.get('JWT_REFRESH_SECRET'),
            );
          } catch (err) {
            this.logger.error(`Invalid refresh token`, err);
            throw new UnauthorizedException(`Invalid refresh token`);
          }
          await new Promise((sleep) => setTimeout(sleep, 150));
          // generate new set of tokens and put them in the response
          const result = await lastValueFrom(this.authService
            .generateJwtTokens({
              sub: userDB.userId,
              userName: userDB.userName,
              intraLogin: userDB.intraLogin,
            })
            .pipe(
              switchMap((tokens) => {
                // put the newly generated tokens in the Request cookies
                req.headers.cookie = `${this.configService.get('JWT_ACCESS_TOKEN_COOKIE_NAME')}=${tokens.jwtAccessToken}; ${this.configService.get('JWT_REFRESH_TOKEN_COOKIE_NAME')}=${tokens.jwtRefreshToken}`;
                // create new cookies to be put in the Response
                const accessCookie = getCookieWithTokens({
                  cookieName: this.configService.get(
                    'JWT_ACCESS_TOKEN_COOKIE_NAME',
                  ),
                  token: tokens.jwtAccessToken,
                  expirationTime: this.configService.get(
                    'JWT_ACCESS_EXPIRATION_TIME',
                  ),
                });
                const refreshCookie = getCookieWithTokens({
                  cookieName: this.configService.get(
                    'JWT_REFRESH_TOKEN_COOKIE_NAME',
                  ),
                  token: tokens.jwtRefreshToken,
                  expirationTime: this.configService.get(
                    'JWT_REFRESH_EXPIRATION_TIME',
                  ),
                });
                return forkJoin([accessCookie, refreshCookie]);
              }),
              // put the newly generated tokens in the Response cookies
              map(([accessCookie, refreshCookie]) => {
                resp.setHeader('Set-Cookie', [accessCookie, refreshCookie]);
                return true;
              }),
            ));
          return result;
        }
      } else {
        this.logger.error(`Authorization error:`, error);
        throw new UnauthorizedException(`Authorization error:`);
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
}
