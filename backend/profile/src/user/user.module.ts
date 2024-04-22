import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { FriendRepository } from './friend.repository';
import { Friend } from './friend.entity';
import { UsernameCache } from './usernameCache';
import { AvatarService } from './avatar.service';
import { AvatarRepository } from './avatar.repository';
import { Avatar } from './avatar.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Friend, Avatar])],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    FriendRepository,
    UsernameCache,
    AvatarService,
    AvatarRepository,
  ],
  exports: [TypeOrmModule, UserRepository, UserService],
})
export class UserModule {}
