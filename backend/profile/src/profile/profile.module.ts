import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Stats } from 'src/stats/stats.entity';
import { ProfileController } from './profile.controller';
import { UserModule } from 'src/user/user.module';
import { StatsModule } from 'src/stats/stats.module';
import { Game } from 'src/game/game.entity';
import { GameModule } from 'src/game/game.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Game, Stats]),
    UserModule,
    StatsModule,
    GameModule,
  ],
  providers: [ProfileService],
  controllers: [ProfileController],
})
export class ProfileModule {}
