import { Repository } from 'typeorm';
import { User } from './user.entity';
import { v4 as uuid } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user-dto';
import { InternalServerErrorException, Logger } from '@nestjs/common';

export class UserRepository extends Repository<User> {
  private logger: Logger = new Logger(UserRepository.name);
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
    const { intraLogin, userName } = createUserDto;

    const user: User = this.create({
      user_id: uuid(),
      intra_login: intraLogin,
      user_name: userName,
    });

    try {
      await this.save(user);
    } catch (error) {
      if (error.code !== '23505') {
        // '23505' means duplicate entry
        this.logger.error(
          `Error saving user ${user.intra_login} in the database`,
        );
        throw new InternalServerErrorException(
          `Error saving user ${user.intra_login} in the database`,
        );
      }
    }
    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      this.createQueryBuilder()
        .delete()
        .where('user_id = :user_id', { user_id: userId })
        .execute();
    } catch (error) {
      this.logger.error(`Error deleting user ${userId} from database`);
      throw new InternalServerErrorException(
        `Error deleting user ${userId} from database`,
      );
    }
  }
}
