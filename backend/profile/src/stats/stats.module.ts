import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsService } from './stats.service';
import { StatsRepository } from './stats.repository';
import { Stats } from './stats.entity';
import { Game } from 'src/game/game.entity';
import { GameRepository } from 'src/game/game.repository';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Game, Stats]), UserModule],
  controllers: [StatsController],
  providers: [GameRepository, StatsService, StatsRepository],
  exports: [StatsService],
})
export class StatsModule {}
