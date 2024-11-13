import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Avatar } from './avatar.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AvatarDto } from './avatar-dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AvatarRepository extends Repository<Avatar> {
  private logger: Logger = new Logger(AvatarRepository.name);
  constructor(
    @InjectRepository(Avatar) private avatarRepository: Repository<Avatar>,
  ) {
    super(
      avatarRepository.target,
      avatarRepository.manager,
      avatarRepository.queryRunner,
    );
  }

  async uploadAvatar(avatarDto: AvatarDto): Promise<string> {
    const { userId, avatar, mimeType } = avatarDto;
    let record = await this.findOneBy({ user_id: userId });
    if (!record) {
      record = this.create({
        user_id: userId,
        avatar: avatar,
        mime_type: mimeType,
      });
    } else {
      record.avatar = avatar;
      record.mime_type = mimeType;
    }
    try {
      this.save(record);
      return record.user_id;
    } catch (error) {
      this.logger.error(`Error uploading avatar of user ${userId}: `, error);
      throw new RpcException(
        new NotFoundException(`Error uploading avatar of user ${userId}`),
      );
    }
  }

  async getAvatar(user_id: string): Promise<AvatarDto> {
    const record = await this.findOneBy({ user_id });
    if (!record) {
      this.logger.error(`No avatar record found for user with ID ${user_id}`);
      throw new RpcException(
        new NotFoundException(
          `No avatar record found for user with ID ${user_id}`,
        ),
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
