import { Injectable, Req } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { TwoFactorAuthDto } from 'src/tfa/dto/two-factor-auth-dto';
import { TwoFactorAuthService } from 'src/tfa/two-factor-auth.service';

@Injectable()
export class TfaStrategy extends PassportStrategy(Strategy, 'tfa') {
  constructor(private readonly tfaService: TwoFactorAuthService) {
    super();
  }
  async validate(@Req() req) {
    const tfaDto: TwoFactorAuthDto = req.body;
    if (await this.tfaService.isTwoFactorAuthenticationCodeValid(tfaDto)) {
      return tfaDto.userId;
    } else {
      return null;
    }
  }
}
