import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserStatus } from './user-status.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserStatusDto } from './dto/user-status-dto';
import { RpcException } from '@nestjs/microservices';
import { StatusChangeDto } from './dto/status-change-dto';
import { UserStatusEnum } from './enum/kafka.enum';

@Injectable()
export class UserStatusRepository extends Repository<UserStatus> {
  private logger: Logger = new Logger(UserStatusRepository.name);
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
        this.logger.error(
          `Error when adding status of user ${userStatusDto.userId}`,
          error,
        );
        throw new RpcException(
          new InternalServerErrorException(
            error.driverError + '; ' + error.detail, // to be tested
          ),
        );
      }
    }
    return status;
  }

  async changeUserStatus(
    statusChangeDto: StatusChangeDto,
  ): Promise<UserStatus> {
    const { userId, oldStatus, newStatus } = statusChangeDto;
    const statusEntry = await this.findOneBy({ user_id: userId });
    if (statusEntry) {
      if (
        statusEntry.status === UserStatusEnum.OFFLINE &&
        (oldStatus === UserStatusEnum.CHAT_ONLINE ||
          oldStatus === UserStatusEnum.GAME)
      ) {
        return statusEntry;
      }
      statusEntry.status = newStatus;
      try {
        return this.save(statusEntry);
      } catch (error) {
        this.logger.error(
          `Error when saving changed status of user ${statusChangeDto.userId}`,
        );
        throw new RpcException(
          new InternalServerErrorException(
            error.driverError + '; ' + error.detail,	// to be tested
          ),
        );
      }
    } else {
      // create status
      try {
        this.createStatusEntry({ userId, status: newStatus });
      } catch (error) {
        throw new RpcException(
          new NotFoundException(`User with ID "${userId}" not found`),
        );
      }
    }
  }
}
