import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './game.entity';
import { GameService } from './game.service';
import { GameRepository } from './game.repository';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { FriendRepository } from 'src/user/friend.repository';
import { UsernameCache } from 'src/user/usernameCache';

@Module({
  imports: [TypeOrmModule.forFeature([Game]), UserModule],
  controllers: [GameController],
  providers: [
    GameService,
    GameRepository,
    UserService,
    FriendRepository,
    UsernameCache,
  ],
  exports: [GameService],
})
export class GameModule {}
