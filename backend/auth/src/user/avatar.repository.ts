import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Avatar } from './avatar.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AvatarDto } from './dto/avatar-dto';

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

  async createAvatarRecord(avatarDto: AvatarDto): Promise<string> {
    const record: Avatar = this.create({
      user_id: avatarDto.userId,
      mime_type: avatarDto.mimeType,
      avatar: avatarDto.avatar,
    });
    try {
      await this.save(record);
    } catch (error) {
		// here try to save a default avatar image
      this.logger.error(
        `Error saving avatar of user ${avatarDto.userId} in the database`,
      );
      throw new InternalServerErrorException(
        `Error saving avatar of user ${avatarDto.userId} in the database`,
      );
    }
    return record.user_id;
  }
}
