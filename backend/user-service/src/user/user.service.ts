import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { UserNameCache } from '../utils/user-nameCache';
import { UserStatusDto } from './dto/user-status-dto';
import { UserStatusRepository } from './user-status.repository';
import { UserStatus } from './user-status.entity';
import { UserIdNameStatusDto } from './dto/user-id-name-status-dto';
import { UserIdNameDto } from './dto/user-id-name-dto';
import { KafkaTopic, UserStatusEnum } from './enum/kafka.enum';
import { ClientKafka } from '@nestjs/microservices';
import { AvatarRepository } from '../avatar/avatar.repository';
import { AvatarDto } from '../avatar/avatar-dto';

@Injectable()
export class UserService {
  userStatuses: UserStatusDto[];
  constructor(
    @Inject('USERNAME_SERVICE') private usernameClient: ClientKafka,
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectRepository(AvatarRepository)
    private readonly avatarRepository: AvatarRepository,
    private readonly userStatusRepository: UserStatusRepository,
    private readonly userNameCache: UserNameCache,
  ) {
    this.userStatuses = [];
  }

  async getUserIdNameStatus(userId: string): Promise<UserIdNameStatusDto> {
    try {
      const user = await this.getUserById(userId);
      const status = await this.getUserStatus(userId);
      return {
        userId,
        userName: user.user_name,
        status: status.status,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new BadRequestException();
      }
    }
  }

  async getUserById(userId: string): Promise<User> {
    return this.userRepository.getUserById(userId);
  }

  async getTotalNoOfUsers(): Promise<number> {
    return await this.userRepository.count();
  }

  async setUserName(userIdNameDto: UserIdNameDto): Promise<User> {
    const found = await this.getUserById(userIdNameDto.userId);
    if (found) {
      found.user_name = userIdNameDto.userName;
      this.userRepository.save(found);
      this.userNameCache.setUserName(userIdNameDto);
      this.usernameClient.emit(KafkaTopic.USERNAME_CHANGE, userIdNameDto);
    }
    return found;
  }

  async getUserName(userId: string): Promise<string> {
    let userName = this.userNameCache.getUserName(userId);
    if (userName) {
      return userName;
    }
    userName = await this.userRepository.getUserName(userId);
    this.userNameCache.setUserName({ userId, userName });
    return userName;
  }

  async createUserStatus(userId: string): Promise<UserStatus> {
    return this.userStatusRepository.createStatusEntry({
      userId,
      status: UserStatusEnum.ONLINE,
    });
  }

  async changeUserStatus(userStatusDto: UserStatusDto): Promise<UserStatus> {
    return this.userStatusRepository.changeUserStatus(userStatusDto);
  }

  async getUserStatus(userId: string): Promise<UserStatus> {
    return this.userStatusRepository.findOneBy({ user_id: userId });
  }

  async getAllUserIds(): Promise<string[]> {
    return this.userRepository.getAllUserIds();
  }

  // Avatar

  async setAvatar(avatarDto: AvatarDto): Promise<string> {
    return this.avatarRepository.uploadAvatar(avatarDto);
  }

  async getAvatar(userId: string): Promise<AvatarDto> {
    return this.avatarRepository.getAvatar(userId);
  }
}
