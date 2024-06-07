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
  Observable,
  catchError,
  forkJoin,
  lastValueFrom,
  map,
  of,
  switchMap,
  throwError,
} from 'rxjs';
import { UserIdNameLoginDto } from 'src/dto/user-id-name-login-dto';
import { RpcException } from '@nestjs/microservices';

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
        const refreshTokenActivation: Observable<boolean> =
          this.activateWithRefreshToken(req).pipe(
            catchError((error) => throwError(() => new UnauthorizedException())),
            switchMap((user: UserIdNameLoginDto) => {
              if (!user) {
                // token is missing, invalid, expired or has been destroyed
                throw new UnauthorizedException();
              } else {
                // generate new set of tokens and put them in the response
                return this.authService
                  .generateJwtTokens({
                    sub: user.userId,
                    userName: user.userName,
                    intraLogin: user.intraLogin,
                  })
                  .pipe(
                    switchMap((tokens) => {
                      // put the newly generated tokens in the Request cookies
                      req.headers.cookie = `${this.configService.get('JWT_ACCESS_TOKEN_COOKIE_NAME')}=${tokens.jwtAccessToken}; ${this.configService.get('JWT_REFRESH_TOKEN_COOKIE_NAME')}=${tokens.jwtRefreshToken}`;
                      const accessCookie = this.authService.getCookieWithTokens(
                        {
                          cookieName: this.configService.get(
                            'JWT_ACCESS_TOKEN_COOKIE_NAME',
                          ),
                          token: tokens.jwtAccessToken,
                          expirationTime: this.configService.get(
                            'JWT_ACCESS_EXPIRATION_TIME',
                          ),
                        },
                      );
                      //   create new cookies to be put in the Response
                      const refreshCookie =
                        this.authService.getCookieWithTokens({
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
                      resp.setHeader('Set-Cookie', [
                        accessCookie,
                        refreshCookie,
                      ]);
                      return true;
                    }),
                  );
              }
            }),
          );
        return lastValueFrom(refreshTokenActivation);
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

  activateWithRefreshToken(req): Observable<UserIdNameLoginDto | null> {
    // extract the refresh token from cookies
    return this.authService
      .extractTokenFromCookies({
        cookie: req.get('cookie'),
        cookieName: this.configService.get('JWT_REFRESH_TOKEN_COOKIE_NAME'),
      })
      .pipe(
        switchMap((refreshToken) => {
          if (!refreshToken) {
            return of(null);
          } else {
            // validate the refresh token and get the user that the token belongs to
            return this.authService
              .validateRefreshToken(
                refreshToken,
                this.configService.get('JWT_REFRESH_SECRET'),
              )
              .pipe(
                catchError((error) =>
                  throwError(() => new RpcException(error.response)),
                ),
              );
          }
        }),
      );
  }
}
