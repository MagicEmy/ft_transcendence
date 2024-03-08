import { Body, Controller, Patch, Post } from '@nestjs/common';
import { GameService } from './game.service';
import { SingleGameStartDto } from './dto/single-game-start-dto';
import { DoubleGameStartDto } from './dto/double-game-start-dto';
import { SingleGameEndDto } from './dto/single-game-end-dto';
import { DoubleGameEndDto } from './dto/double-game-end-dto';

@Controller('game')
export class GameController {
  constructor(private gameService: GameService) {}

  @Post('single')
  announceSingleGameStart(
    @Body() singleGameStartDto: SingleGameStartDto,
  ): void {
    this.gameService.announceSingleGameStart(singleGameStartDto);
  }

  @Post('double')
  announceDoubleGameStart(
    @Body() doubleGameStartDto: DoubleGameStartDto,
  ): void {
    this.gameService.announceDoubleGameStart(doubleGameStartDto);
  }

  @Patch('single/end')
  announceSingleGameEnd(@Body() singleGameEndDto: SingleGameEndDto): void {
    this.gameService.announceSingleGameEnd(singleGameEndDto);
  }

  @Patch('double/end')
  announceDoubleGameEnd(@Body() doubleGameEndDto: DoubleGameEndDto): void {
    this.gameService.announceDoubleGameEnd(doubleGameEndDto);
  }
}
