import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { InjectRepository } from '@nestjs/typeorm';
import { TfaRepository } from './tfa.repository';
import { Tfa } from './tfa.entity';
import { CreareTFADto } from './dto/create-tfa-dto';
import { TwoFactorAuthDto } from './dto/two-factor-auth-dto';
import { UserIdNameDto } from './dto/user-id-name-dto';
import { UserIdQrCodeDto } from './dto/user-id-qr-code-dto';

@Injectable()
export class TwoFactorAuthService {
  constructor(
    @InjectRepository(TfaRepository)
    private readonly tfaRepository: TfaRepository,
  ) {}

  async generateTwoFactorAuthenticationSecret(
    userIdNameDto: UserIdNameDto,
  ): Promise<string> {
    const secret = authenticator.generateSecret();
    const otpAuthUrl = authenticator.keyuri(
      userIdNameDto.userName,
      'CTRL-ALT-DEFEAT',
      secret,
    );
    try {
      await this.addTwoFactorSecret(userIdNameDto.userId, secret);
      return otpAuthUrl;
    } catch (error) {
      throw error;
    }
  }

  async generateQrCodeDataURL(otpAuthUrl: string) {
    return toDataURL(otpAuthUrl);
  }

  async isTwoFactorAuthenticationCodeValid(
    twoFactorAuthDto: TwoFactorAuthDto,
  ): Promise<boolean> {
    return authenticator.verify({
      token: twoFactorAuthDto.code,
      secret: await this.getTwoFactorAuthenticationSecret(
        twoFactorAuthDto.userId,
      ),
    });
  }

  async disableTwoFactorAuthentication(userId: string): Promise<Tfa> {
    return await this.tfaRepository.disableTwoFactorAuthentication(userId);
  }

  private async addTwoFactorSecret(
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

  async createTfaRecord(userId: string): Promise<Tfa> {
    return this.tfaRepository.createTfaRecord(userId);
  }

  async getQrCode(userId: string): Promise<string | null> {
    return this.tfaRepository.getQrCode(userId);
  }

  async saveQrCode(userIdQrCodeDto: UserIdQrCodeDto): Promise<string | null> {
    return this.tfaRepository.addQrCode(userIdQrCodeDto);
  }
}
