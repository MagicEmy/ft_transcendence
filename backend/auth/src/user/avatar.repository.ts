import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Avatar } from './avatar.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AvatarDto } from './dto/avatar-dto';

@Injectable()
export class AvatarRepository extends Repository<Avatar> {
  constructor(
    @InjectRepository(Avatar) private avatarRepository: Repository<Avatar>,
  ) {
    super(
      avatarRepository.target,
      avatarRepository.manager,
      avatarRepository.queryRunner,
    );
  }

  async createAvatarRecord(avatarDto: AvatarDto): Promise<string> {
    const { userId, avatar, mimeType } = avatarDto;
    const record: Avatar = this.create({
      user_id: userId,
      avatar,
      mime_type: mimeType,
    });
    await this.save(record);
    return record.user_id;
  }
}
