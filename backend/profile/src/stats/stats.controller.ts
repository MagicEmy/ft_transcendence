import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateSingleGameDto } from './dto/create-single-game-dto';
import { UpdateSingleGameEndDto } from './dto/update-single-game-end-dto';
import { SingleGame } from './single-game.entity';
import { StatsService } from './stats.service';
import { CreateDoubleGameDto } from './dto/create-double-game-dto';
import { DoubleGame } from './double-game.entity';
import { UpdateDoubleGameEndDto } from './dto/update-double-game-end-dto';

@Controller('stats')
export class StatsController {
  constructor(private statsService: StatsService) {}

  @Post('single')
  createSingleGame(
    @Body() createSingleGameDto: CreateSingleGameDto,
  ): Promise<SingleGame> {
    return this.statsService.createSingleGame(createSingleGameDto);
  }

  @Post('double')
  createDoubleGame(
    @Body() createDoubleGameDto: CreateDoubleGameDto,
  ): Promise<DoubleGame> {
    return this.statsService.createDoubleGame(createDoubleGameDto);
  }

  @Get('single/:id')
  getSingleGameById(@Param('id') id: string): Promise<SingleGame> {
    return this.statsService.getSingleGameById(id);
  }

  @Get('double/:id')
  getDoubleGameById(@Param('id') id: string): Promise<DoubleGame> {
    return this.statsService.getDoubleGameById(id);
  }

  @Patch('single/:id/end')
  updateSingleGameEnd(
    @Param('id') id: string,
    @Body() updateSingleGameEndDto: UpdateSingleGameEndDto,
  ): Promise<SingleGame> {
    return this.statsService.updateSingleGameEnd(id, updateSingleGameEndDto);
  }

  @Patch('double/:id/end')
  updateDoubleGameEnd(
    @Param('id') id: string,
    @Body() updateDoubleGameEndDto: UpdateDoubleGameEndDto,
  ): Promise<DoubleGame> {
    return this.statsService.updateDoubleGameEnd(id, updateDoubleGameEndDto);
  }
}
