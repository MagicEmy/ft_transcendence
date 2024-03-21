import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Game } from 'src/stats/game/game.entity';
import { Stats } from 'src/stats/stats.entity';
import { ProfileController } from './profile.controller';
import { UserModule } from 'src/user/user.module';
import { StatsModule } from 'src/stats/stats.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Game, Stats]),
    UserModule,
    StatsModule,
  ],
  providers: [ProfileService],
  controllers: [ProfileController],
})
export class ProfileModule {}
