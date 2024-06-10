import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { Observable, catchError, from, map, switchMap, throwError } from 'rxjs';
import { CookieAndCookieNameDto } from 'src/dto/cookie-and-cookie-name-dto';
import { CookieTokenDto } from 'src/dto/cookie-token-dto';
import { JwtPayloadDto } from 'src/dto/jwt-payload-dto';
import { TokensDto } from 'src/dto/tokens-dto';
import * as jwt from 'jsonwebtoken';
import { UserIdNameLoginDto } from 'src/dto/user-id-name-login-dto';
import { DeleteRefreshTokenDto } from 'src/dto/delete-refresh-token-dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @Inject('AuthService') private readonly authService: ClientProxy,
    private readonly configService: ConfigService,
  ) {}

  generateJwtTokens(jwtPayloadDto: JwtPayloadDto): Observable<TokensDto> {
    const pattern = 'getTokens';
    const payload = jwtPayloadDto;
    return this.authService
      .send<TokensDto>(pattern, payload)
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
      );
  }

  getCookieWithTokens(cookieTokenDto: CookieTokenDto): Observable<string> {
    const pattern = 'getCookie';
    const payload = cookieTokenDto;
    return this.authService.send<string>(pattern, payload);
  }

  extractTokenFromCookies(
    cookieAndCookieName: CookieAndCookieNameDto,
  ): Observable<string> {
    const pattern = 'getTokenFromCookies';
    const payload = cookieAndCookieName;
    return this.authService
      .send<string>(pattern, payload)
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
      );
  }

  validateRefreshToken(refreshToken: string, secret: string): any {
    try {
      const user = jwt.verify(refreshToken, secret);
      console.log('verify output:', user);
      return user;
    } catch (error) {
      this.deleteRefreshTokenFromDB({
        refreshToken: refreshToken,
      });
      throw error;
    }
  }

  getUserByRefreshToken(refreshToken: string): Observable<UserIdNameLoginDto> {
    const pattern = 'getUserByRefreshToken';
    const payload = refreshToken;
    return this.authService
      .send<UserIdNameLoginDto>(pattern, payload)
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
      );
  }

  deleteRefreshTokenFromDB(deleteRefreshTokenDto: DeleteRefreshTokenDto): void {
    const pattern = 'deleteRefreshTokenFromDB';
    const payload = deleteRefreshTokenDto;
    this.authService.emit(pattern, payload);
  }

  getJwtTokenPayload(cookies: string): Observable<any> {
    return this.extractTokenFromCookies({
      cookie: cookies,
      cookieName: this.configService.get('JWT_ACCESS_TOKEN_COOKIE_NAME'),
    }).pipe(
      switchMap((token) =>
        from(
          new Promise((resolve, reject) => {
            jwt.verify(
              token,
              this.configService.get('JWT_ACCESS_SECRET'),
              (err, decoded) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(decoded);
                }
              },
            );
          }),
        ).pipe(
          map((decoded: any) => {
            return {
              userId: decoded.sub,
              userName: decoded.userName,
            };
          }),
          catchError((error) => {
            return throwError(
              () => new RpcException(new UnauthorizedException()),
            );
          }),
        ),
      ),
    );
  }

  createMockUsers(no: number): Observable<string[]> {
    const pattern = 'createUsers';
    const payload = no;
    return this.authService.send(pattern, payload);
  }
}
