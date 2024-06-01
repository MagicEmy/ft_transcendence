import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserService } from './user/user.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configValidationSchema } from './utils/config.schema';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/user.entity';
import { UserStatus } from './user/user-status.entity';
import { UserRepository } from './user/user.repository';
import { UserStatusRepository } from './user/user-status.repository';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserNameCache } from './utils/user-nameCache';
import { AvatarRepository } from './avatar/avatar.repository';
import { Avatar } from './avatar/avatar.entity';
import { Friendship } from './friend/friendship.entity';
import { FriendService } from './friend/friend.service';
import { FriendshipRepository } from './friend/friendship.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env`],
      validationSchema: configValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([User, UserStatus, Avatar, Friendship]),
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
  controllers: [AppController],
  providers: [
    UserService,
    UserRepository,
    UserStatusRepository,
    UserNameCache,
    AvatarRepository,
    FriendService,
    FriendshipRepository,
  ],
})
export class AppModule {}
