import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @EventPattern('game_end')
  createGame(data: any): void {
    this.gameService.createGame(data);
  }
}
