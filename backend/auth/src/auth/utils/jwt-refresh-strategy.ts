import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtRefreshStrategy.extractRefreshTokenFromCookies,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
    });
  }

  validate(payload: { sub: string }) {
    return { user_id: payload.sub };
  }

  private static extractRefreshTokenFromCookies(req): string | null {
    // this function will be adjusted once the cookie-parser is installed
    const cookies = req.get('cookie').split(';');

    let refreshCookieValue = null;
    cookies.forEach((cookie) => {
      const [name, value] = cookie.trim().split('=');
      if (name === 'Refresh') {
        refreshCookieValue = value;
      }
    });
    return refreshCookieValue;

    // BELOW TO BE USED WITH COOKIE-PARSER
    // if (req.cookies && req.cookies['Authentication']) {
    //   console.log(`about to return ${req.cookies['Authentication']}`);
    //   return req.cookies['Authentication'];
    // }
    // return null;
  }
}
