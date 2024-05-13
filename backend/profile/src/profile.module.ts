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
import { Avatar } from './avatar/avatar.entity';
import { UserRepository } from './user/user.repository';
import { UserController } from './user/user.controller';
import { ProfileService } from './profile.service';
import { AvatarService } from './avatar/avatar.service';
import { AvatarRepository } from './avatar/avatar.repository';
import { Stats } from './stats/stats.entity';

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
    UserModule,
  ],
  controllers: [ProfileController, UserController],
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
