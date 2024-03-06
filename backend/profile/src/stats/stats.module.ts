import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { SingleGameRepository } from './single-game.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SingleGame } from './single-game.entity';
import { StatsService } from './stats.service';

@Module({
  imports: [TypeOrmModule.forFeature([SingleGame])],
  controllers: [StatsController],
  providers: [SingleGameRepository, StatsService],
  exports: [SingleGameRepository],
})
export class StatsModule {}
