import { Repository } from 'typeorm';
import { User } from './user.entity';
import { v4 as uuid } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user-dto';

export class UserRepository extends Repository<User> {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    super(
      userRepository.target,
      userRepository.manager,
      userRepository.queryRunner,
    );
  }
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { user_name, email } = createUserDto;

    const user: User = {
      user_id: uuid(),
      user_name,
      email,
    };

    await this.save(user);
    return user;
  }
}
