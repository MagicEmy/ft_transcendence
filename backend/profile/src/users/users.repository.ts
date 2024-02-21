import { Repository } from 'typeorm';
import { Users } from './users.entity';
import { v4 as uuid } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user-dto';

export class UsersRepository extends Repository<Users> {
  constructor(
    @InjectRepository(Users) private userRepository: Repository<Users>,
  ) {
    super(
      userRepository.target,
      userRepository.manager,
      userRepository.queryRunner,
    );
  }

  async createUser(createUserDto: CreateUserDto): Promise<Users> {
    const { user_name, email, avatar_path } = createUserDto;
    const path = avatar_path ?? '/images/default.jpg';

    const user: Users = {
      user_id: uuid(),
      user_name,
      email,
      avatar_path: path,
    };

    await this.save(user);
    return user;
  }
}
