import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
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
      this.logger.error(`User with ID "${userId}" not found`);
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
      this.logger.error(
        `User with ID "${userId}" not found; failed to fetch userName`,
      );
      throw new RpcException(
        new NotFoundException(
          `User with ID "${userId}" not found; failed to fetch userName`,
        ),
      );
    } else {
      return fromDB.userName;
    }
  }

  async setUserName(userIdNameDto: UserIdNameDto): Promise<User> {
    {
      const found = await this.findOneBy({ user_id: userIdNameDto.userId });
      if (!found) {
        this.logger.error(
          `Unable to set userName of user ${userIdNameDto.userId}`,
        );
        throw new RpcException(
          new NotFoundException(
            `User with ID "${userIdNameDto.userId}" not found`,
          ),
        );
      }
      found.user_name = userIdNameDto.userName;
      try {
        await this.save(found);
        return found;
      } catch (error) {
        if (error.code === '23505') {
          // '23505' means duplicate entry
          this.logger.error(
            `UserName ${userIdNameDto.userName} is already taken`,
          );
          throw new RpcException(
            new BadRequestException(
              `UserName ${userIdNameDto.userName} is already taken`,
            ),
          );
        } else {
          this.logger.error(`An unknown error occurred`);
          throw new RpcException(
            new InternalServerErrorException(`An unknown error occurred`),
          );
        }
      }
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
