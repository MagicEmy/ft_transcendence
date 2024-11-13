import { InjectRepository } from '@nestjs/typeorm';
import { CreateTFADto } from '../user/dto/create-tfa-dto';
import { Repository } from 'typeorm';
import { Tfa } from './tfa.entity';
import {
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserIdQrCodeDto } from './dto/user-id-qr-code-dto';

export class TfaRepository extends Repository<Tfa> {
  private logger: Logger = new Logger(TfaRepository.name);
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
      tfa.is_enabled = createTfaDto.is_enabled;
      tfa.secret = createTfaDto.secret;
    } else {
      tfa = this.create(createTfaDto);
    }
    try {
      this.save(tfa);
      return tfa;
    } catch (error) {
      this.logger.error(
        `Adding 2FA for user ${createTfaDto.user_id} to the database failed`,
      );
      throw new InternalServerErrorException(
        `Adding 2FA for user ${createTfaDto.user_id} to the database failed`,
      );
    }
  }

  async getTwoFactorAuthenticationSecret(user_id: string): Promise<string> {
    const tfa = await this.findOneBy({ user_id: user_id });
    return tfa ? tfa.secret : '';
  }

  async enableTwoFactorAuthentication(user_id: string): Promise<Tfa> {
    const tfa = await this.findOneBy({ user_id: user_id });
    tfa.is_enabled = true;
    try {
      this.save(tfa);
      return tfa;
    } catch (error) {
      this.logger.error(`Error enabling TFA for user ${user_id}`);
      throw new InternalServerErrorException(
        `Error enabling TFA for user ${user_id}`,
      );
    }
  }

  async disableTwoFactorAuthentication(user_id: string): Promise<Tfa> {
    const tfa = await this.findOneBy({ user_id: user_id });
    tfa.is_enabled = false;
    try {
      this.save(tfa);
      return tfa;
    } catch (error) {
      this.logger.error(`Error disabling TFA for user ${user_id}`);
      throw new InternalServerErrorException(
        `Error disabling TFA for user ${user_id}`,
      );
    }
  }

  async isTwoFactorAuthenticationEnabled(user_id: string): Promise<boolean> {
    const tfa = await this.findOneBy({ user_id: user_id });
    if (!tfa) {
      this.logger.error(`No Tfa record found for user ${user_id}`);
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
      if (error.code !== '23505') {
        // '23505' means duplicate entry
        this.logger.error(`Error creating a TFA record for user ${userId}`);
        throw new InternalServerErrorException(
          `Error creating a TFA record for user ${userId}`,
        );
      }
    }
  }

  async addQrCode(userIdQrCodeDto: UserIdQrCodeDto): Promise<string | null> {
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
