import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayloadDto } from '../dto/jwt-payload-dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayloadDto) {
    console.log(payload);
    return {
      user_id: payload.sub,
      user_name: payload.user_name,
      intra_login: payload.intra_login,
    }; // this goes into the handleRequest() function in the AuthGuard
  }
}
