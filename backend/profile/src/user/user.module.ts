import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { FriendRepository } from '../friend/friend.repository';
import { Friend } from '../friend/friend.entity';
import { UsernameCache } from '../utils/usernameCache';
import { AvatarService } from '../avatar/avatar.service';
import { AvatarRepository } from '../avatar/avatar.repository';
import { Avatar } from '../avatar/avatar.entity';
import { FriendService } from '../friend/friend.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Friend, Avatar])],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    FriendRepository,
    FriendService,
    UsernameCache,
    AvatarService,
    AvatarRepository,
  ],
  exports: [
    TypeOrmModule,
    UserRepository,
    UserService,
    FriendService,
    FriendRepository,
  ],
})
export class UserModule {}
