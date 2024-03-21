import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsService } from './stats.service';
import { Game } from './game/game.entity';
import { GameRepository } from './game/game.repository';
import { StatsRepository } from './stats.repository';
import { Stats } from './stats.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Game, Stats])],
  controllers: [StatsController],
  providers: [GameRepository, StatsService, StatsRepository],
  exports: [StatsService],
})
export class StatsModule {}
