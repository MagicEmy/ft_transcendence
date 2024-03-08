import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { SingleGameRepository } from './single-game.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SingleGame } from './single-game.entity';
import { StatsService } from './stats.service';
import { DoubleGame } from './double-game.entity';
import { DoubleGameRepository } from './double-game.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SingleGame, DoubleGame])],
  controllers: [StatsController],
  providers: [SingleGameRepository, DoubleGameRepository, StatsService],
  exports: [SingleGameRepository, DoubleGameRepository],
})
export class StatsModule {}
