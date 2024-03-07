import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user-dto';
import { Users } from './users.entity';
import { UsersRepository } from './users.repository';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersRepository)
    private userRepository: UsersRepository,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<Users> {
    return this.userRepository.createUser(createUserDto);
  }

  async getUserById(id: string): Promise<Users> {
    const found = await this.userRepository.findOneBy({ user_id: id });

    if (!found) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return found;
  }

  async changeUserName(id: string, user_name: string): Promise<Users> {
    const found = await this.getUserById(id);
    if (!found) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    found.user_name = user_name;
    this.userRepository.save(found);
    return found;
  }
}
