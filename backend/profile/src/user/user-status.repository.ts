import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserStatus } from './user-status.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserStatusDto } from 'src/dto/user-status-dto';

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
    const status: UserStatus = this.create(userStatusDto);
    try {
      await this.save(status);
    } catch (error) {
      if (error.code !== '23505') {
        console.log(error);
      } else {
        console.log(
          `Status entry for user ${userStatusDto.user_id} is already present`,
        );
      }
    }
    return status;
  }

  async changeUserStatus(userStatusDto: UserStatusDto): Promise<UserStatus> {
    const { user_id, status } = userStatusDto;
    const statusEntry = await this.findOneBy({ user_id });
    statusEntry.status = status;
    return this.save(statusEntry);
  }
}
