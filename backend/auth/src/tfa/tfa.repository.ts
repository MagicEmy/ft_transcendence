import { InjectRepository } from '@nestjs/typeorm';
import { CreateTFADto } from '../user/dto/create-tfa-dto';
import { Repository } from 'typeorm';
import { Tfa } from './tfa.entity';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserIdQrCodeDto } from './dto/user-id-qr-code-dto';

export class TfaRepository extends Repository<Tfa> {
  constructor(@InjectRepository(Tfa) private tfaRepository: Repository<Tfa>) {
    super(
      tfaRepository.target,
      tfaRepository.manager,
      tfaRepository.queryRunner,
    );
  }
  async addTwoFactorAuthentication(createTfaDto: CreateTFADto): Promise<Tfa> {
    let tfa = await this.findOneBy({ user_id: createTfaDto.user_id });
    if (tfa) {
      tfa.is_enabled = true;
      tfa.secret = createTfaDto.secret;
    } else {
      tfa = this.create(createTfaDto);
    }
    this.save(tfa);
    return tfa;
  }

  async getTwoFactorAuthenticationSecret(user_id: string): Promise<string> {
    const tfa = await this.findOneBy({ user_id: user_id });
    return tfa.secret;
  }

  // CURRENTLY NOT BEING USED
  //   async enableTwoFactorAuthentication(user_id: string): Promise<Tfa> {
  //     const tfa = await this.findOneBy({ user_id: user_id });
  //     tfa.is_enabled = true;
  //     this.save(tfa);
  //     return tfa;
  //   }

  async disableTwoFactorAuthentication(user_id: string): Promise<Tfa> {
    const tfa = await this.findOneBy({ user_id: user_id });
    tfa.is_enabled = false;
    this.save(tfa);
    return tfa;
  }

  async isTwoFactorAuthenticationEnabled(user_id: string): Promise<boolean> {
    const tfa = await this.findOneBy({ user_id: user_id });
    if (!tfa) {
      throw new NotFoundException(`No Tfa record found for user ${user_id}`);
    }
    return tfa.is_enabled;
  }

  async createTfaRecord(userId: string): Promise<Tfa> {
    const tfa = this.create({
      user_id: userId,
      secret: null,
      is_enabled: false,
    });
    try {
      this.save(tfa);
      return tfa;
    } catch (error) {
      console.log('TFA repository caught', error);
      throw error;
    }
  }

  async addQrCode(userIdQrCodeDto: UserIdQrCodeDto): Promise<string> {
    const { userId, qrCode } = userIdQrCodeDto;
    const tfaRecord = await this.findOneBy({ user_id: userId });
    if (!tfaRecord) {
      throw new NotFoundException(`No tfa record found for user ${userId}`);
    }
    tfaRecord.qr_code = qrCode;
    try {
      this.save(tfaRecord);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error when trying to save the tfa QR code for user ${userId}`,
      );
    }
    return userId;
  }

  async getQrCode(userId: string): Promise<string | null> {
    const tfaRecord = await this.findOneBy({ user_id: userId });
    if (tfaRecord) {
      return tfaRecord.qr_code;
    }
    return null;
  }
}
