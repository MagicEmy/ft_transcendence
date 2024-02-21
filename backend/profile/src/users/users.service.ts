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
    console.log('in createUser service');
    const { user_name, email, avatar_path } = createUserDto;

    const user = this.userRepository.create({
      user_name,
      email,
      avatar_path: avatar_path ?? '/images/default.jpg',
    });

    await this.userRepository.save(user);

    return user;
  }

  async getUserById(id: string): Promise<Users> {
    const found = await this.userRepository.findOneBy({ user_id: id });

    if (!found) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return found;
  }
}
