import { Controller } from '@nestjs/common';
import { StatsService } from './stats.service';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class StatsController {
  constructor(private statsService: StatsService) {}

  @EventPattern('single_game_start')
  handleSingleGameStart(data: any) {
    this.statsService.handleSingleGameStart(data);
  }

  @EventPattern('single_game_end')
  handleSingleGameEnd(data: any) {
    this.statsService.handleSingleGameEnd(data);
  }

  @EventPattern('double_game_start')
  handleDoubleGameStart(data: any) {
    this.statsService.handleDoubleGameStart(data);
  }

  @EventPattern('double_game_end')
  handleDoubleGameEnd(data: any) {
    this.statsService.handleDoubleGameEnd(data);
  }
}
