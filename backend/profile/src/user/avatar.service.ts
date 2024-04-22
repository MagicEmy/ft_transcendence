import { Injectable } from '@nestjs/common';
import { AvatarRepository } from './avatar.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { AvatarDto } from './dto/avatar-dto';

@Injectable()
export class AvatarService {
  constructor(
    @InjectRepository(AvatarRepository)
    private readonly avatarRepository: AvatarRepository,
  ) {}

  async createAvatarRecord(user_id: string) {
    return this.avatarRepository.createAvatarRecord({
      user_id: user_id,
      image: null,
    });
  }

  //   async createAvatarRecord(avatarDto: AvatarDto) {
  //     return this.avatarRepository.createAvatarRecord(avatarDto);
  //   }

  async setAvatar(avatarDto: AvatarDto) {
    this.avatarRepository.uploadAvatar(avatarDto);
  }
}
