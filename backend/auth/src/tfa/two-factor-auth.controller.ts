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
import { Tfa } from './tfa.entity';

@Controller('TwoFactorAuth')
export class TwoFactorAuthController {
  constructor(private readonly authenticationService: TwoFactorAuthService) {}

  @Post('create')
  async register(@Body() userIdNameDto: UserIdNameDto) {
    let qrCode: string = await this.authenticationService.getQrCode(
      userIdNameDto.userId,
    );
    if (!qrCode) {
      try {
        const otpAuthUrl =
          await this.authenticationService.generateTwoFactorAuthenticationSecret(
            userIdNameDto,
          );
        qrCode =
          await this.authenticationService.generateQrCodeDataURL(otpAuthUrl);
        try {
          this.authenticationService.saveQrCode({
            userId: userIdNameDto.userId,
            qrCode,
          });
        } catch (error) {
          // no need to do anything if saving in DB didn't work
        }
      } catch (error) {
        throw error;
      }
    }
    return qrCode;
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
      throw new UnauthorizedException('Wrong authentication code');
    }
    return this.authenticationService.enableTwoFactorAuthentication(
      twoFactorAuthDto.userId,
    );
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
  async disableTwoFactorAuthentication(
    @Body('userId') userId: string,
  ): Promise<Tfa> {
    return this.authenticationService.disableTwoFactorAuthentication(userId);
  }

  @Get('isEnabled')
  async isTwoFactorAuthenticationEnabled(
    @Query('id') userId: string,
  ): Promise<boolean> {
    return this.authenticationService.isTwoFactorAuthenticationEnabled(userId);
  }
}
