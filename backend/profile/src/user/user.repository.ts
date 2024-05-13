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

  async getUserById(user_id: string): Promise<User> {
    const found = await this.findOneBy({ user_id: user_id });
    if (!found) {
      throw new NotFoundException(`User with ID "${user_id}" not found`);
    }
    return found;
  }

  async getUsername(user_id: string) {
    const fromDB = await this.createQueryBuilder('users')
      .select('user_name')
      .where('user_id = :user_id', { user_id })
      .getRawOne();
    if (!fromDB) {
      return '<user deleted>';
    } else {
      return fromDB.user_name;
    }
  }
}
