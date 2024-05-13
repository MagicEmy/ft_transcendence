import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { UsernameCache } from '../utils/usernameCache';
import { UserStatusDto } from 'src/dto/user-status-dto';
import { UserStatusEnum } from 'src/utils/user-status.enum';
import { UserStatusRepository } from './user-status.repository';
import { UserStatus } from './user-status.entity';
import { UserInfoDto } from 'src/dto/profile-dto';

@Injectable()
export class UserService {
  userStatuses: UserStatusDto[];
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly userStatusRepository: UserStatusRepository,
    private readonly usernameCache: UsernameCache,
  ) {
    this.userStatuses = [];
  }

  async getUserInfoForProfile(user_id: string): Promise<UserInfoDto> {
    try {
      const user = await this.getUserById(user_id);
      const status = await this.getUserStatus(user_id);
      return {
        user_id: user_id,
        user_name: user.user_name,
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

  async getUserById(id: string): Promise<User> {
    return this.userRepository.getUserById(id);
  }

  async getTotalNoOfUsers(): Promise<number> {
    return await this.userRepository.count();
  }

  async getUserByIntraLogin(intra_login: string): Promise<User> {
    return await this.userRepository.findOneBy({
      intra_login: intra_login,
    });
  }

  async changeUsername(user_id: string, user_name: string): Promise<User> {
    const found = await this.getUserById(user_id);
    // if (!found) {
    //   throw new NotFoundException(`User with ID "${user_id}" not found`);
    // }
    // -> THIS SHOULD NOT BE NECESSARY
    found.user_name = user_name;
    this.userRepository.save(found);
    return found;
  }

  async getUsername(user_id: string): Promise<string> {
    let user_name = this.usernameCache.getUsername(user_id);
    if (user_name) {
      return user_name;
    }

    user_name = await this.userRepository.getUsername(user_id);
    this.usernameCache.setUsername(user_id, user_name);
    return user_name;
  }

  async createUserStatus(user_id: string): Promise<UserStatus> {
    return this.userStatusRepository.createStatusEntry({
      user_id,
      status: UserStatusEnum.ONLINE,
    });
  }

  async changeUserStatus(userStatusDto: UserStatusDto): Promise<UserStatus> {
    return this.userStatusRepository.changeUserStatus(userStatusDto);
  }

  async getUserStatus(user_id: string): Promise<UserStatus> {
    return this.userStatusRepository.findOneBy({ user_id: user_id });
  }
}
