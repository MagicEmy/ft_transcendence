import { CookieAndCookieNameDto } from "src/dto/cookie-and-cookie-name-dto";
import { CookieTokenDto } from "src/dto/cookie-token-dto";
import {Observable, of} from 'rxjs';

export function extractTokenFromCookies(
  cookieAndCookieName: CookieAndCookieNameDto,
): string {
  let tokenValue: string;
  if (cookieAndCookieName.cookie) {
    cookieAndCookieName.cookie
      .toString()
      .split(';')
      .forEach((cookie) => {
        const [name, value] = cookie.trim().split('=');
        if (name === cookieAndCookieName.cookieName) {
          tokenValue = value;
        }
      });
  }
  return tokenValue;
}

export function getCookieWithTokens(cookieTokenDto: CookieTokenDto): Observable<string> {
    const cookie = `${cookieTokenDto.cookieName}=${cookieTokenDto.token}; Path=/; HttpOnly; Max-Age=${cookieTokenDto.expirationTime}`;
    return of(cookie);
  }
