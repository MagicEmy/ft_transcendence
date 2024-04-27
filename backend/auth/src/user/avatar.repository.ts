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
    console.log('createAvatarRecord in repo; avatarDto is');
    console.log(avatarDto);
    const record: Avatar = this.create(avatarDto);
    await this.save(record);
    console.log('created avatar record');
    console.log(record);
    return record.user_id;
  }

  async uploadAvatar(avatarDto: AvatarDto): Promise<string> {
    const { user_id, avatar, mime_type } = avatarDto;
    const record = await this.findOneBy({ user_id: user_id });
    if (record) {
      console.log('OLD:');
      console.log(record.avatar);
      record.avatar = avatar;
      record.mime_type = mime_type;
      console.log('NEW:');
      console.log(record.avatar);
      this.save(record);
      return record.user_id;
    } else {
      throw new NotFoundException(
        `No avatar record found for user with ID ${user_id}`,
      );
    }
  }

  async getAvatar(user_id: string): Promise<AvatarDto> {
    console.log('* in repo');
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
