import { Module } from '@nestjs/common';
import { UserService } from './user.service';
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
import { UserStatus } from './user-status.entity';
import { UserStatusRepository } from './user-status.repository';
import { UserController } from './user.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Friend, Avatar, UserStatus]),
    ClientsModule.register([
      {
        name: 'USERNAME_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'username-client',
            brokers: ['kafka:29092'],
          },
          consumer: {
            groupId: 'chat-consumer',
          },
        },
      },
    ]),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    FriendRepository,
    FriendService,
    UsernameCache,
    AvatarService,
    AvatarRepository,
    UserStatusRepository,
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
