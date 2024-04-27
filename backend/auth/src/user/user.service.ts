import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user-dto';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { AvatarRepository } from './avatar.repository';
import { AvatarDto } from './dto/avatar-dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    @InjectRepository(AvatarRepository)
    private avatarRepository: AvatarRepository,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    return this.userRepository.createUser(createUserDto);
  }

  async createAvatarRecord(avatarDto: AvatarDto): Promise<string> {
    console.log('createAvatarRecord - avatarDto is');
    console.log(avatarDto);
    return this.avatarRepository.createAvatarRecord(avatarDto);
  }

  async getUserByIntraLogin(intra_login: string): Promise<User> {
    return await this.userRepository.findOneBy({
      intra_login: intra_login,
    });
  }
}
