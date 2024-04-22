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

  async createAvatarRecord(avatarDto: AvatarDto) {
    const record: Avatar = this.create(avatarDto);
    await this.save(record);
    console.log('created avatar record');
    console.log(record);
  }

  async uploadAvatar(avatarDto: AvatarDto) {
    const { user_id, image } = avatarDto;
    const record = await this.findOneBy({ user_id: user_id });
    if (record) {
      record.avatar = image;
      this.save(record);
    } else {
      throw new NotFoundException(
        `No avatar record found for user with ID ${user_id}`,
      );
    }
  }
}
