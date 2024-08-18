import { Module } from '@nestjs/common';
import { GameModule } from './game/game.module';
import { GameManager } from './game/GameManager';

@Module({
  imports: [GameModule],
  controllers: [],
  providers: [GameManager],
  exports: [],
})
export class AppModule {}
