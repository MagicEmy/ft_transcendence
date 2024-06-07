import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserStatus } from './user-status.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserStatusDto } from './dto/user-status-dto';
import { RpcException } from '@nestjs/microservices';

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
        // '23505' means duplicate entry
        throw new RpcException(new InternalServerErrorException());
      }
    }
    return status;
  }

  async changeUserStatus(userStatusDto: UserStatusDto): Promise<UserStatus> {
    const { userId, status } = userStatusDto;
    const statusEntry = await this.findOneBy({ user_id: userId });
    if (statusEntry) {
      statusEntry.status = status;
    } else {
      throw new RpcException(
        new NotFoundException(`User with ID "${userId}" not found`),
      );
    }
    try {
      return this.save(statusEntry);
    } catch (error) {
      throw new RpcException(new InternalServerErrorException());
    }
  }
}
