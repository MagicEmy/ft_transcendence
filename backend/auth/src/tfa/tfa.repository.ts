import { InjectRepository } from '@nestjs/typeorm';
import { CreareTFADto } from '../user/dto/create-tfa-dto';
import { Repository } from 'typeorm';
import { Tfa } from './tfa.entity';

export class TfaRepository extends Repository<Tfa> {
  constructor(@InjectRepository(Tfa) private tfaRepository: Repository<Tfa>) {
    super(
      tfaRepository.target,
      tfaRepository.manager,
      tfaRepository.queryRunner,
    );
  }
  async addTwoFactorAuthentication(createTfaDto: CreareTFADto): Promise<Tfa> {
    let tfa = await this.findOne({
      where: { user_id: createTfaDto.user_id },
    });
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
    const tfa = await this.findOne({
      where: { user_id: user_id },
    });
    return tfa.secret;
  }

  async enableTwoFactorAuthentication(user_id: string): Promise<Tfa> {
    const tfa = await this.findOne({ where: { user_id: user_id } });
    tfa.is_enabled = true;
    this.save(tfa);
    return tfa;
  }

  async disableTwoFactorAuthentication(user_id: string): Promise<Tfa> {
    const tfa = await this.findOne({ where: { user_id: user_id } });
    tfa.is_enabled = false;
    this.save(tfa);
    return tfa;
  }

  async isTwoFactorAuthenticationEnabled(user_id: string): Promise<boolean> {
    const tfa = await this.findOne({ where: { user_id: user_id } });
    return tfa.is_enabled;
  }
}
