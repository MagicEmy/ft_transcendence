import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsService } from './stats.service';
import { Game } from './game/game.entity';
import { GameRepository } from './game/game.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Game])],
  controllers: [StatsController],
  providers: [GameRepository, StatsService],
  exports: [GameRepository],
})
export class StatsModule {}
