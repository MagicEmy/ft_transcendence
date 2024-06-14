import { Module } from '@nestjs/common';
import { GameModule } from './game/game.module';
import { GameManager } from './game/NewGameManager';

@Module({
  imports: [GameModule],
  controllers: [],
  providers: [GameManager],
  exports: [],
})
export class AppModule {}
