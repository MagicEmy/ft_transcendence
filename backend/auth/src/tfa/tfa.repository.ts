import { InjectRepository } from '@nestjs/typeorm';
import { CreateTFADto } from '../user/dto/create-tfa-dto';
import { Repository } from 'typeorm';
import { Tfa } from './tfa.entity';
import { NotFoundException } from '@nestjs/common';

export class TfaRepository extends Repository<Tfa> {
  constructor(@InjectRepository(Tfa) private tfaRepository: Repository<Tfa>) {
    super(
      tfaRepository.target,
      tfaRepository.manager,
      tfaRepository.queryRunner,
    );
  }
  async addTwoFactorAuthentication(createTfaDto: CreateTFADto): Promise<Tfa> {
    let tfa = await this.findOne({ user_id: createTfaDto.user_id });
    if (tfa) {
      tfa.is_enabled = true;
      tfa.secret = createTfaDto.secret;
    } else {
      tfa = this.create(createTfaDto);
      return tfa;
    }
    this.save(tfa);
    return tfa;
  }

  async getTwoFactorAuthenticationSecret(user_id: string): Promise<string> {
    const tfa = await this.findOneBy({ user_id: user_id });
    return tfa.secret;
  }

  async enableTwoFactorAuthentication(user_id: string): Promise<Tfa> {
    const tfa = await this.findOneBy({ user_id: user_id } );
    tfa.is_enabled = true;
    this.save(tfa);
    return tfa;
  }

  async disableTwoFactorAuthentication(user_id: string): Promise<Tfa> {
    const tfa = await this.findOneBy({user_id: user_id });
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
}
