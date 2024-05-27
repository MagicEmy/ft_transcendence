import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayloadDto } from '../dto/jwt-payload-dto';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractAccessTokenFromCookies,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  static extractAccessTokenFromCookies(req): string {
    const cookies = req.get('cookie');
    let tokenValue = '';
    if (cookies) {
      cookies.split(';').forEach((cookie) => {
        const [name, value] = cookie.trim().split('=');
        if (name === 'Authentication') {
          tokenValue = value;
        }
      });
    }
    return tokenValue;
  }

  async validate(payload: JwtPayloadDto) {
    console.log(payload);
    return {
      user_id: payload.sub,
      user_name: payload.userName,
      intra_login: payload.intraLogin,
    }; // this goes into the handleRequest() method in the AuthGuard
  }
}
