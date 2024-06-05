import { Controller, Body, Post, UnauthorizedException } from '@nestjs/common';
import { TwoFactorAuthService } from './two-factor-auth.service';
import { TwoFactorAuthDto } from './dto/two-factor-auth-dto';

@Controller('TwoFactorAuth')
export class TwoFactorAuthController {
  constructor(private readonly authenticationService: TwoFactorAuthService) {}

  @Post('create')
  async register(@Body() userId: string) {
    const otpAuthUrl =
      await this.authenticationService.generateTwoFactorAuthenticationSecret(
        userId,
      );

    return await this.authenticationService.generateQrCodeDataURL(otpAuthUrl);
  }

  @Post('enable')
  async turnOnTwoFactorAuthentication(
    @Body() twoFactorAuthDto: TwoFactorAuthDto,
  ) {
    const isCodeValid =
      await this.authenticationService.isTwoFactorAuthenticationCodeValid(
        twoFactorAuthDto.secret,
        twoFactorAuthDto.userId,
      );
    if (!isCodeValid) {
      await this.authenticationService.disableTwoFactorAuthentication(
        twoFactorAuthDto.userId,
      );
      throw new UnauthorizedException('Wrong authentication code');
    }
  }

  @Post('authenticate')
  async authenticate(@Body() twoFactorAuthDto: TwoFactorAuthDto) {
    const isCodeValid =
      await this.authenticationService.isTwoFactorAuthenticationCodeValid(
        twoFactorAuthDto.secret,
        twoFactorAuthDto.userId,
      );

    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
  }

  @Post('disable')
  async disableTwoFactorAuthentication(@Body() userId: string) {
    await this.authenticationService.disableTwoFactorAuthentication(userId);
  }
}
