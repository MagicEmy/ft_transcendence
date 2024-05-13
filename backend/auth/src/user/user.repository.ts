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
    const { intra_login, user_name } = createUserDto;

    const user: User = this.create({
      user_id: uuid(),
      intra_login,
      user_name,
    });

    try {
      await this.save(user);
    } catch (error) {
      if (error.code !== '23505') {
        console.log(error);
      }
    }
    return user;
  }
}
