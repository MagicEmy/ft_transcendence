import { Body, Controller, Patch, Post } from '@nestjs/common';
import { GameService } from './game.service';
import { GameEndDto } from './dto/game-end-dto';

@Controller('game')
export class GameController {
  constructor(private gameService: GameService) {}

  @Post()
  announceGameEnd(
    @Body() gameEndDto: GameEndDto,
  ): void {
    this.gameService.announceGameEnd(gameEndDto);
  }
}
