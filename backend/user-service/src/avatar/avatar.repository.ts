import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Avatar } from './avatar.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AvatarDto } from './avatar-dto';

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
    const record: Avatar = this.create({
      user_id: avatarDto.userId,
      mime_type: avatarDto.mimeType,
      avatar: avatarDto.avatar,
    });
    await this.save(record);
    return record.user_id;
  }

  async uploadAvatar(avatarDto: AvatarDto): Promise<string> {
    const { userId, avatar, mimeType } = avatarDto;
    const record = await this.findOneBy({ user_id: userId });
    if (record) {
      record.avatar = avatar;
      record.mime_type = mimeType;
      this.save(record);
      return record.user_id;
    } else {
      throw new NotFoundException(
        `No avatar record found for user with ID ${userId}`,
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
      return {
        userId: record.user_id,
        avatar: record.avatar,
        mimeType: record.mime_type,
      };
    }
  }
}
