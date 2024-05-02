import { Controller, Get, Param } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { GameService } from './game.service';
import { GameHistoryDto } from './dto/game-history-dto';
// import { GameEndDto } from './dto/game-end-dto';
// import { Body, Post } from '@nestjs/common';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @EventPattern('game_end')
  createGame(data: any): void {
    this.gameService.createGame(data);
  }

  // for testing purposes only
  //   @Post()
  //   createGame1(@Body() gameEndDto: GameEndDto): void {
  //     this.gameService.createGame(gameEndDto);
  //   }

  @Get('/:id/game_history')
  getGameHistory(@Param('id') id: string): Promise<GameHistoryDto[]> {
    return this.gameService.getGameHistory(id);
  }
}
