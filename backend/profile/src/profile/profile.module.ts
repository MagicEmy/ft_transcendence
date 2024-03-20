import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Game } from 'src/stats/game/game.entity';
import { Stats } from 'src/stats/stats.entity';
import { UserService } from 'src/user/user.service';
import { UserRepository } from 'src/user/user.repository';
import { GameRepository } from 'src/stats/game/game.repository';
import { StatsRepository } from 'src/stats/stats.repository';
import { ProfileController } from './profile.controller';
import { StatsService } from 'src/stats/stats.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Game, Stats])],
  providers: [
    ProfileService,
    UserService,
    StatsService,
    UserRepository,
    GameRepository,
    StatsRepository,
  ],
  controllers: [ProfileController],
})
export class ProfileModule {}
