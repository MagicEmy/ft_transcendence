import { Injectable } from '@nestjs/common';
import { AvatarRepository } from './avatar.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { AvatarDto } from '../dto/avatar-dto';

@Injectable()
export class AvatarService {
  constructor(
    @InjectRepository(AvatarRepository)
    private readonly avatarRepository: AvatarRepository,
  ) {}

  async setAvatar(avatarDto: AvatarDto): Promise<string> {
    return this.avatarRepository.uploadAvatar(avatarDto);
  }

  async getAvatar(user_id: string): Promise<AvatarDto> {
    return this.avatarRepository.getAvatar(user_id);
  }
}
