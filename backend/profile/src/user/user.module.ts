import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { FriendRepository } from './friend.repository';
import { Friend } from './friend.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Friend])],
  controllers: [UserController],
  providers: [UserService, UserRepository, FriendRepository],
  exports: [TypeOrmModule, UserRepository, UserService],
})
export class UserModule {}
