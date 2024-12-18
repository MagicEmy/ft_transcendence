import { Inject, Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { UserNameCache } from '../utils/user-nameCache';
import { UserStatusDto } from './dto/user-status-dto';
import { UserStatusRepository } from './user-status.repository';
import { UserStatus } from './user-status.entity';
import { UserIdNameStatusDto } from './dto/user-id-name-status-dto';
import { UserIdNameDto } from './dto/user-id-name-dto';
import { KafkaTopic, PlayerInfo, UserStatusEnum } from './enum/kafka.enum';
import { ClientKafka } from '@nestjs/microservices';
import { AvatarRepository } from '../avatar/avatar.repository';
import { AvatarDto } from '../avatar/avatar-dto';
import { StatusChangeDto } from './dto/status-change-dto';
import { IPlayerInfo } from './interface/kafka.interface';

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

  //   USER

  async getUserIdNameStatus(
    userId: string,
    requestingUserId: string,
  ): Promise<UserIdNameStatusDto> {
    try {
      const user = await this.getUserById(userId);
      const status =
        userId == requestingUserId
          ? UserStatusEnum.ONLINE
          : (await this.getUserStatus(userId)).status;
      return {
        userId,
        userName: user.user_name,
        status: status,
      };
    } catch (error) {
      throw error;
    }
  }

  async getUserById(userId: string): Promise<User> {
    return this.userRepository.getUserById(userId);
  }

  async getTotalNoOfUsers(): Promise<number> {
    return this.userRepository.count();
  }

  async getAllUserIds(): Promise<string[]> {
    return this.userRepository.getAllUserIds();
  }

  async setUserName(userIdNameDto: UserIdNameDto): Promise<User> {
    try {
      const user = this.userRepository.setUserName(userIdNameDto);
      this.userNameCache.setUserName(userIdNameDto);
      this.usernameClient.emit(KafkaTopic.USERNAME_CHANGE, userIdNameDto);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async getUserName(userId: string): Promise<string> {
    let userName = this.userNameCache.getUserName(userId);
    if (!userName) {
      try {
        userName = await this.userRepository.getUserName(userId);
        this.userNameCache.setUserName({ userId, userName });
      } catch (error) {
        throw error;
      }
    }
    return userName;
  }

  announcePlayerName(playerInfo: IPlayerInfo) {
    this.usernameClient.emit(PlayerInfo.REPLY, playerInfo);
  }

  //   STATUS

  async createUserStatus(userId: string): Promise<UserStatus> {
    return this.userStatusRepository.createStatusEntry({
      userId,
      status: UserStatusEnum.ONLINE,
    });
  }

  async changeUserStatus(
    statusChangeDto: StatusChangeDto,
  ): Promise<UserStatus> {
    return this.userStatusRepository.changeUserStatus(statusChangeDto);
  }

  async getUserStatus(userId: string): Promise<UserStatus> {
    let status = await this.userStatusRepository.findOneBy({
      user_id: userId,
    });
    if (!status) {
      try {
        status = await this.createUserStatus(userId);
      } catch (error) {
        throw error;
      }
    }
    return status;
  }

  // AVATAR

  async setAvatar(avatarDto: AvatarDto): Promise<string> {
    return this.avatarRepository.uploadAvatar(avatarDto);
  }

  async getAvatar(userId: string): Promise<AvatarDto> {
    return this.avatarRepository.getAvatar(userId);
  }
}
