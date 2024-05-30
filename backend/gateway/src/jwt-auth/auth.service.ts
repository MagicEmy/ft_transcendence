import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable, of, switchMap } from 'rxjs';
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
    return this.authService.send<TokensDto>(pattern, payload);
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
    return this.authService.send<string>(pattern, payload);
  }

  validateRefreshToken(
    refreshToken: string,
    secret: string,
  ): Observable<UserIdNameLoginDto | null> {
    try {
      jwt.verify(refreshToken, secret);
      return this.getUserByRefreshToken(refreshToken);
    } catch (error) {
      this.deleteRefreshTokenFromDB({
        refreshToken: refreshToken,
      });
      return of(null);
    }
  }

  getUserByRefreshToken(refreshToken: string): Observable<UserIdNameLoginDto> {
    const pattern = 'getUserByRefreshToken';
    const payload = refreshToken;
    return this.authService.send<UserIdNameLoginDto>(pattern, payload);
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
      switchMap((token) => {
        if (!token) {
          return of(null);
        } else {
          return of(
            jwt.verify(token, this.configService.get('JWT_ACCESS_SECRET')),
          );
        }
      }),
    );
  }
}
