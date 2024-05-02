import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-42';
import { AuthService } from '../auth.service';
import { UserWithTokenDto } from '../dto/user-with-token-dto';

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
        avatar: 'image.versions.medium',
      },
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    console.log('Validating...');
    console.log(accessToken);
    console.log(refreshToken);
    console.log(profile.intra_login, profile.avatar);
    // do here something with refresh token in the auth service?
    // check whether it is already in the request, otherwise add to User
    const user = await this.authService.validateUser({
      intra_login: profile.intra_login,
      avatar_url: profile.avatar,
    });
    const userWithToken: UserWithTokenDto = {
      user_id: user.user_id,
      user_name: user.user_name,
      intra_login: user.intra_login,
      refresh_token: refreshToken,
    };
    return userWithToken || null;
  }
}
