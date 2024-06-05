import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
    const record: Avatar = this.create({
      user_id: avatarDto.userId,
      mime_type: avatarDto.mimeType,
      avatar: avatarDto.avatar,
    });
    try {
      await this.save(record);
    } catch (error) {
      throw new InternalServerErrorException();
    }
    return record.user_id;
  }
}
