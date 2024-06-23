import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { UserIdNameDto } from './dto/user-id-name-dto';

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

  async getUserById(userId: string): Promise<User> {
    const found = await this.findOneBy({ user_id: userId });
    if (!found) {
      throw new RpcException(
        new NotFoundException(`User with ID "${userId}" not found`),
      );
    }
    return found;
  }

  async getUserName(userId: string) {
    const fromDB = await this.createQueryBuilder('users')
      .select('user_name', 'userName')
      .where('user_id = :user_id', { user_id: userId })
      .getRawOne();
    if (!fromDB) {
      throw new RpcException(
        new NotFoundException(`User with ID "${userId}" not found`),
      );
    } else {
      return fromDB.userName;
    }
  }

  async setUserName(userIdNameDto: UserIdNameDto): Promise<User> {
    console.log('in repo');

    const found = await this.findOneBy({ user_id: userIdNameDto.userId });
    if (!found) {
      this.logger.error(`User with ID "${userIdNameDto.userId}" not found`);
      throw new RpcException(
        new NotFoundException(
          `User with ID "${userIdNameDto.userId}" not found`,
        ),
      );
    }
    found.user_name = userIdNameDto.userName;
    try {
      console.log('in repo in try block');
      await this.userRepository.save(found);
      return found;
    } catch (error) {
      this.logger.error(
        `Failed to set userName of user ${userIdNameDto.userId} to ${userIdNameDto.userName}`,
      );
      console.log(error)
      throw new RpcException(new BadRequestException());
    }
  }

  async getAllUserIds(): Promise<string[]> {
    const result = await this.createQueryBuilder('users')
      .select('user_id', 'userId')
      .getRawMany();
    const allUserIds: string[] = result.map((user) => user.userId);
    return allUserIds;
  }
}
