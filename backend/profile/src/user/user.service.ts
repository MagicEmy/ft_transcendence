import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfileUserInfoDto } from '../dto/profile-user-info-dto';
import { UsernameCache } from '../utils/usernameCache';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly usernameCache: UsernameCache,
  ) {}

  async getUserInfoForProfile(user_id: string): Promise<ProfileUserInfoDto> {
    try {
      const user = await this.getUserById(user_id);
      return {
        user_id: user_id,
        user_name: user.user_name,
      };
    } catch (error) {
      console.log(error);
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
}
