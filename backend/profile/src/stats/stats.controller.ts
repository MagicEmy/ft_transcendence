import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateSingleGameDto } from './dto/create-single-game-dto';
import { UpdateSingleGameEndDto } from './dto/update-single-game-end-dto';
import { SingleGame } from './single-game.entity';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
  constructor(private statsService: StatsService) {}

  @Post('single')
  createSingleGame(
    @Body() createSingleGameDto: CreateSingleGameDto,
  ): Promise<SingleGame> {
    return this.statsService.createSingleGame(createSingleGameDto);
  }

  @Get('single/:id')
  getSingleGameById(@Param('id') id: string): Promise<SingleGame> {
    return this.statsService.getSingleGameById(id);
  }

  @Patch('single/:id/end')
  updateSingleGame(
    @Param('id') id: string,
    @Body() updateSingleGameEndDto: UpdateSingleGameEndDto,
  ): Promise<SingleGame> {
    return this.statsService.updateSingleGame(id, updateSingleGameEndDto);
  }
}
