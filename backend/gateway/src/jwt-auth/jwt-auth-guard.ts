import {
  ExecutionContext,
  Injectable,
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
  throwError,
} from 'rxjs';

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
    console.log(
      `JWT AuthGuard triggered for target ${req.get('Host')}${req.url} with cookie ${req.get('cookie')}`,
    );
    const resp: Response = context.switchToHttp().getResponse();
    try {
      await super.canActivate(context);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        // verify whether the refresh token exists in the database
        let refreshToken: string;
        const userDB = await lastValueFrom(
          this.authService
            .extractTokenFromCookies({
              cookie: req.get('cookie'),
              cookieName: this.configService.get(
                'JWT_REFRESH_TOKEN_COOKIE_NAME',
              ),
            })
            .pipe(
              switchMap((token) => {
                refreshToken = token;
                return this.authService
                  .getUserByRefreshToken(token)
                  .pipe(
                    catchError((error) =>
                      throwError(() => new UnauthorizedException()),
                    ),
                  );
              }),
            ),
        );
        if (!userDB || !refreshToken) {
          // token is missing, invalid, expired, has been destroyed or does not exist in the DB
          throw new UnauthorizedException();
        } else {
          try {
            this.authService.validateRefreshToken(
              refreshToken,
              this.configService.get('JWT_REFRESH_SECRET'),
            );
          } catch (error) {
            console.log('caught', error);
            throw new UnauthorizedException();
          }
          await new Promise((sleep) => setTimeout(sleep, 150));
          // generate new set of tokens and put them in the response
          const result = this.authService
            .generateJwtTokens({
              sub: userDB.userId,
              userName: userDB.userName,
              intraLogin: userDB.intraLogin,
            })
            .pipe(
              switchMap((tokens) => {
                // put the newly generated tokens in the Request cookies
                req.headers.cookie = `${this.configService.get('JWT_ACCESS_TOKEN_COOKIE_NAME')}=${tokens.jwtAccessToken}; ${this.configService.get('JWT_REFRESH_TOKEN_COOKIE_NAME')}=${tokens.jwtRefreshToken}`;
                const accessCookie = this.authService.getCookieWithTokens({
                  cookieName: this.configService.get(
                    'JWT_ACCESS_TOKEN_COOKIE_NAME',
                  ),
                  token: tokens.jwtAccessToken,
                  expirationTime: this.configService.get(
                    'JWT_ACCESS_EXPIRATION_TIME',
                  ),
                });
                //   create new cookies to be put in the Response
                const refreshCookie = this.authService.getCookieWithTokens({
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
            );
          return lastValueFrom(result);
        }
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
}
