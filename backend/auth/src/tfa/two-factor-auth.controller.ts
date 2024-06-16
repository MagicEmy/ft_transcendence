import {
  Controller,
  Body,
  Post,
  UnauthorizedException,
  Query,
  Get,
} from '@nestjs/common';
import { TwoFactorAuthService } from './two-factor-auth.service';
import { TwoFactorAuthDto } from './dto/two-factor-auth-dto';
import { UserIdNameDto } from './dto/user-id-name-dto';

@Controller('TwoFactorAuth')
export class TwoFactorAuthController {
  constructor(private readonly authenticationService: TwoFactorAuthService) {}

  @Post('create')
  async register(@Body() userIdNameDto: UserIdNameDto) {
    const otpAuthUrl =
      await this.authenticationService.generateTwoFactorAuthenticationSecret(
        userIdNameDto,
      );

    return await this.authenticationService.generateQrCodeDataURL(otpAuthUrl);
  }

  @Post('enable')
  async turnOnTwoFactorAuthentication(
    @Body() twoFactorAuthDto: TwoFactorAuthDto,
  ) {
    const isCodeValid =
      await this.authenticationService.isTwoFactorAuthenticationCodeValid(
        twoFactorAuthDto,
      );
    if (!isCodeValid) {
      await this.authenticationService.disableTwoFactorAuthentication(
        twoFactorAuthDto.userId,
      );
      throw new UnauthorizedException('Wrong authentication code');
    }
  }

  //   @Post('authenticate')
  //   async authenticate(@Body() twoFactorAuthDto: TwoFactorAuthDto) {
  //     const isCodeValid =
  //       await this.authenticationService.isTwoFactorAuthenticationCodeValid(
  //         twoFactorAuthDto,
  //       );

  //     if (!isCodeValid) {
  //       throw new UnauthorizedException('Wrong authentication code');
  //     }
  //   }

  @Post('disable')
  async disableTwoFactorAuthentication(@Body('userId') userId: string) {
    await this.authenticationService.disableTwoFactorAuthentication(userId);
  }

  @Get('isEnabled')
  async isTwoFactorAuthenticationEnabled(
    @Query('id') userId: string,
  ): Promise<boolean> {
    return this.authenticationService.isTwoFactorAuthenticationEnabled(userId);
  }
}
