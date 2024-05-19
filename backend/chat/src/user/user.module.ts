import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UserRepository } from './user.repository';
import { BlockedUserRepository } from './blocked-user.repository';
import { BlockedUser } from 'src/entities/blocked-user.entity';
import { KafkaProducerService } from 'src/kafka/kafka-producer.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, BlockedUser])],
  providers: [
    UserService,
    UserRepository,
    BlockedUserRepository,
    KafkaProducerService,
  ],
  exports: [UserService],
})
export class UserModule {}
