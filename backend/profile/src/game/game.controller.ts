import { Controller, Get, Param } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { GameService } from './game.service';
import { GamesAgainstUserIdDto } from './dto/games-against-userid-dto';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @EventPattern('game_end')
  createGame(data: any): void {
    this.gameService.createGame(data);
  }

  // make match history for each user

  @Get('/:id')
  mostFrequentOpponent(
    @Param('id') id: string,
  ): Promise<GamesAgainstUserIdDto> {
    return this.gameService.mostFrequentOpponent(id);
  }
}
