import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

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

  async getUserById(userId: string): Promise<User> {
    const found = await this.findOneBy({ user_id: userId });
    if (!found) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }
    return found;
  }

  async getUserName(userId: string) {
    const fromDB = await this.createQueryBuilder('users')
      .select('user_name', 'userName')
      .where('user_id = :user_id', { user_id: userId })
      .getRawOne();
    if (!fromDB) {
      return null;
    } else {
      return fromDB.userName;
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
