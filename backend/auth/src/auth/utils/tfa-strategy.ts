import { Injectable, Logger, Req } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { TwoFactorAuthService } from 'src/tfa/two-factor-auth.service';
import { AuthService } from '../auth.service';
import { extractUserIdFromCookies } from './get-user-id.decorator';

@Injectable()
export class TfaStrategy extends PassportStrategy(Strategy, 'tfa') {
  private readonly logger: Logger = new Logger(TfaStrategy.name);
  constructor(
    private readonly tfaService: TwoFactorAuthService,
    private readonly authService: AuthService,
  ) {
    super();
  }
  async validate(@Req() req) {
    try {
      const userId = extractUserIdFromCookies(req.get('cookie'), 'userId');
      const code: string = req.body.code;
      if (
        await this.tfaService.isTwoFactorAuthenticationCodeValid({
          userId,
          code,
        })
      ) {
        return userId;
      }
    } catch (error) {
      this.logger.error(error);
    }
    return null;
  }
}
