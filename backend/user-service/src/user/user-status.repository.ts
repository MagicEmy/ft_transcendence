import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserStatus } from './user-status.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserStatusDto } from './dto/user-status-dto';

@Injectable()
export class UserStatusRepository extends Repository<UserStatus> {
  constructor(
    @InjectRepository(UserStatus)
    private userStatusRepository: Repository<UserStatus>,
  ) {
    super(
      userStatusRepository.target,
      userStatusRepository.manager,
      userStatusRepository.queryRunner,
    );
  }
  async createStatusEntry(userStatusDto: UserStatusDto): Promise<UserStatus> {
    const status: UserStatus = this.create({
      user_id: userStatusDto.userId,
      status: userStatusDto.status,
    });
    try {
      await this.save(status);
    } catch (error) {
      if (error.code !== '23505') {
        console.log(error);
      } else {
        console.log(
          `Status entry for user ${userStatusDto.userId} is already present`,
        );
      }
    }
    return status;
  }

  async changeUserStatus(userStatusDto: UserStatusDto): Promise<UserStatus> {
    const { userId, status } = userStatusDto;
    const statusEntry = await this.findOneBy({ user_id: userId });
    statusEntry.status = status;
    return this.save(statusEntry);
  }
}
