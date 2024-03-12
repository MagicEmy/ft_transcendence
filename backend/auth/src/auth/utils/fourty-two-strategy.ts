import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-42';
import { AuthService } from '../auth.service';

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
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    console.log('Validating...');
    console.log(accessToken);
    console.log(refreshToken);
    console.log(profile);
    const user = await this.authService.validateUser({
      intra_login: profile.username,
    });
    console.log(`User is ${user.intra_login}`);
    return user || null;
  }
}
