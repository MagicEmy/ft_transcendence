import { Controller, Get, Param } from '@nestjs/common';
import { ProfileDto } from './dto/profile-dto';
import { GameService } from './game/game.service';
import { EventPattern } from '@nestjs/microservices';
import { GameHistoryDto } from './dto/game-history-dto';
import { StatsService } from './stats/stats.service';
import { LeaderboardStatsDto } from './dto/leaderboard-stats-dto';
import { ProfileService } from './profile.service';

@Controller()
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly gameService: GameService,
    private readonly statsService: StatsService,
  ) {}

  @EventPattern('game_end')
  handleGameEnd(data: any): void {
    this.gameService.createGame(data);
    this.statsService.updateStats(data);
  }

  @EventPattern('new_user')
  createStatsRowNewUser(data: any): void {
    this.statsService.createStatsRowNewUser(data);
  }

  @Get('/profile/:id')
  getProfileById(@Param('id') id: string): Promise<ProfileDto> {
    return this.profileService.getProfileById(id);
  }

  @Get('/games/:id')
  getGameHistory(@Param('id') id: string): Promise<GameHistoryDto[]> {
    return this.gameService.getGameHistory(id);
  }

  @Get('/leaderboard')
  getLeaderboard(): Promise<LeaderboardStatsDto[]> {
    return this.statsService.createLeaderboard({ user_names: true });
  }
}