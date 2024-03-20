import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user-dto';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfileUserInfoDto } from './dto/profile-user-info-dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {}

  async getUserInfoForProfile(user_id: string): Promise<ProfileUserInfoDto> {
    const user = await this.getUserById(user_id);
    return { user_id: user_id, user_name: user.user_name, avatar: user.avatar };
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    return this.userRepository.createUser(createUserDto);
  }

  async getUserById(id: string): Promise<User> {
    const found = await this.userRepository.findOneBy({ user_id: id });

    if (!found) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return found;
  }

  async getTotalNoOfUsers(): Promise<number> {
    return await this.userRepository.count();
  }

  async getUserByIntraLogin(intra_login: string): Promise<User> {
    return await this.userRepository.findOneBy({
      intra_login: intra_login,
    });
  }

  async changeUserName(id: string, user_name: string): Promise<User> {
    const found = await this.getUserById(id);
    if (!found) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    found.user_name = user_name;
    this.userRepository.save(found);
    return found;
  }
}
