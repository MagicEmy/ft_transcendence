import { Controller } from '@nestjs/common';
import { StatsService } from './stats.service';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class StatsController {
  constructor(private statsService: StatsService) {}

  @EventPattern('game_end')
  handleGameEnd(data: any): void {
    this.statsService.handleGameEnd(data);
  }

  @EventPattern('new_user')
  createStatsRowNewUser(data: any): void {
    this.statsService.createStatsRowNewUser(data);
  }
}
