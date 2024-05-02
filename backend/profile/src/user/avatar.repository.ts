import { Injectable, NotFoundException } from '@nestjs/common';
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
    const record: Avatar = this.create(avatarDto);
    await this.save(record);
    return record.user_id;
  }

  async uploadAvatar(avatarDto: AvatarDto): Promise<string> {
    const { user_id, avatar, mime_type } = avatarDto;
    const record = await this.findOneBy({ user_id: user_id });
    if (record) {
      record.avatar = avatar;
      record.mime_type = mime_type;
      this.save(record);
      return record.user_id;
    } else {
      throw new NotFoundException(
        `No avatar record found for user with ID ${user_id}`,
      );
    }
  }

  async getAvatar(user_id: string): Promise<AvatarDto> {
    const record = await this.findOneBy({ user_id });
    if (!record) {
      throw new NotFoundException(
        `No avatar record found for user with ID ${user_id}`,
      );
    } else {
      return record;
    }
  }
}
