import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { InjectRepository } from '@nestjs/typeorm';
import { TfaRepository } from './tfa.repository';
import { Tfa } from './tfa.entity';
import { CreareTFADto } from './dto/create-tfa-dto';

@Injectable()
export class TwoFactorAuthService {
  constructor(
    @InjectRepository(TfaRepository)
    private readonly tfaRepository: TfaRepository,
  ) {}

  async generateTwoFactorAuthenticationSecret(userId: string) {
    const secret = authenticator.generateSecret();
    const otpAuthUrl = authenticator.keyuri(userId, 'OUR_APP_NAME', secret);
    this.addTwoFactorAuthentication(userId, secret);

    return otpAuthUrl;
  }

  async generateQrCodeDataURL(otpAuthUrl: string) {
    return toDataURL(otpAuthUrl);
  }

  async isTwoFactorAuthenticationCodeValid(
    twoFactorAuthenticationCode: string,
    userId: string,
  ) {
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: await this.getTwoFactorAuthenticationSecret(userId),
    });
  }
  async disableTwoFactorAuthentication(userId: string) {
    await this.tfaRepository.disableTwoFactorAuthentication(userId);
  }

  private async addTwoFactorAuthentication(
    userId: string,
    secret: string,
  ): Promise<Tfa> {
    const tfaDto: CreareTFADto = {
      user_id: userId,
      secret,
      is_enabled: false,
    };
    return await this.tfaRepository.addTwoFactorAuthentication(tfaDto);
  }
  async isTwoFactorAuthenticationEnabled(userId: string): Promise<boolean> {
    return await this.tfaRepository.isTwoFactorAuthenticationEnabled(userId);
  }

  async enableTwoFactorAuthentication(userId: string): Promise<Tfa> {
    return await this.tfaRepository.enableTwoFactorAuthentication(userId);
  }

  private async getTwoFactorAuthenticationSecret(
    userId: string,
  ): Promise<string> {
    return await this.tfaRepository.getTwoFactorAuthenticationSecret(userId);
  }
}
