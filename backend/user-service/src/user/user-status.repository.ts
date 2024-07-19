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
      if (error.code === '23503') {
        // '23503' means query error (constraint violation)
        this.logger.debug(`Query error`, error);
      } else if (error.code !== '23505') {
        // '23505' means duplicate entry
        this.logger.error(
          `Error when adding status of user ${userStatusDto.userId}`,
          error,
        );
        throw new RpcException(new InternalServerErrorException());
      }
    }
    return status;
  }

  async changeUserStatus(
    statusChangeDto: StatusChangeDto,
  ): Promise<UserStatus> {
    const { userId, oldStatus, newStatus } = statusChangeDto;
    let statusEntry = await this.findOneBy({ user_id: userId });
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
        this.save(statusEntry);
        return statusEntry;
      } catch (error) {
        this.logger.error(
          `Error when saving changed status of user ${statusChangeDto.userId}`,
        );
        throw new RpcException(
          new InternalServerErrorException(
            error.driverError + '; ' + error.detail, // to be tested
          ),
        );
      }
    } else {
      // create status
      try {
        statusEntry = await this.createStatusEntry({
          userId,
          status: newStatus,
        });
        return statusEntry;
      } catch (error) {
        // handle constraint error if user does not exist and foreign key constraint is violated
        this.logger.error(`[changeUserStatus] caught error: `, error);
        throw new RpcException(
          new NotFoundException(`User with ID "${userId}" not found`),
        );
      }
    }
  }
}
