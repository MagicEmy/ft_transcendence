import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configValidationSchema } from './utils/config.schema';
import { UserModule } from './user/user.module';
import { User } from './user/user.entity';
import { Game } from './game/game.entity';
import { ProfileController } from './profile.controller';
import { GameService } from './game/game.service';
import { GameRepository } from './game/game.repository';
import { FriendRepository } from './friend/friend.repository';
import { UsernameCache } from './utils/usernameCache';
import { StatsService } from './stats/stats.service';
import { StatsRepository } from './stats/stats.repository';
import { Friend } from './friend/friend.entity';
import { UserRepository } from './user/user.repository';
import { ProfileService } from './profile.service';
import { AvatarService } from './avatar/avatar.service';
import { AvatarRepository } from './avatar/avatar.repository';
import { Stats } from './stats/stats.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';

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
    TypeOrmModule.forFeature([User, Friend, Game, Stats]),
    ClientsModule.register([
      {
        name: 'PLAYER_INFO_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'player-info-client',
            brokers: ['kafka:29092'],
          },
          consumer: {
            groupId: 'game-consumer',
          },
        },
      },
    ]),
    UserModule,
  ],
  controllers: [ProfileController],
  providers: [
    ProfileService,
    GameService,
    GameRepository,
    // UserService,
    UserRepository,
    // FriendService,
    FriendRepository,
    StatsService,
    StatsRepository,
    AvatarService,
    AvatarRepository,
    UsernameCache,
  ],
})
export class ProfileModule {}
