import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserStatus } from './user-status.entity';
import { InjectRepository } from '@nestjs/typeorm';

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

  
}
