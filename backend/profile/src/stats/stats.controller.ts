import { Controller, Get } from '@nestjs/common';
import { StatsService } from './stats.service';
import { EventPattern } from '@nestjs/microservices';
import { LeaderboardStatsDto } from 'src/stats/dto/leaderboard-stats-dto';

@Controller('stats')
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

  @Get('/leaderboard')
  getLeaderboard(): Promise<LeaderboardStatsDto[]> {
    return this.statsService.createLeaderboard();
  }
}
