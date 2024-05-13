import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-42';
import { AuthService } from '../auth.service';
import { User } from 'src/user/user.entity';

@Injectable()
export class FourtyTwoStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get('OAUTH_UID'),
      clientSecret: configService.get('OAUTH_SECRET'),
      callbackURL: configService.get('REDIRECT_URL'),
      scope: ['public'],
      profileFields: {
        intra_login: 'login',
        avatar: configService.get('42_IMAGE_VERSION'),
      },
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<User> {
    const user = await this.authService.validateUser({
      intra_login: profile.intra_login,
      avatar_url: profile.avatar,
    });
    return user || null;
  }
}
