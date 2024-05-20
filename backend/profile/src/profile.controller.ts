import { Controller, Get, Param } from '@nestjs/common';
import { ProfileDto } from './dto/profile-dto';
import { GameService } from './game/game.service';
import { EventPattern } from '@nestjs/microservices';
import { GameHistoryDto } from './dto/game-history-dto';
import { StatsService } from './stats/stats.service';
import { LeaderboardStatsDto } from './dto/leaderboard-stats-dto';
import { ProfileService } from './profile.service';
import { GameStatus, KafkaTopic, PlayerInfo } from './utils/kafka.enum';
import { UserService } from './user/user.service';
import { Opponent } from './utils/opponent.enum';

@Controller()
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly gameService: GameService,
    private readonly statsService: StatsService,
    private readonly userService: UserService,
  ) {}

  @EventPattern(GameStatus.TOPIC)
  handleGameEnd(data: any): void {
    this.gameService.createGame(data);
    this.statsService.updateStats(data);
  }

  @EventPattern(PlayerInfo.TOPIC)
  handlePlayerInfoRequest(data: any): void {
    this.profileService.providePlayerInfoToGame(data.playerID);
  }

  @EventPattern(KafkaTopic.NEW_USER)
  createStatsRowNewUser(data: any): void {
    this.statsService.createStatsRowNewUser(data);
  }

  @Get('/profile/:id')
  getProfileById(@Param('id') id: string): Promise<ProfileDto> {
    return this.profileService.getProfileById(id);
  }

  @Get('/games/simulate')
  async simulateGames(): Promise<string[]> {
    // get all user ids
    let repeats: number;
    const allUserIds = await this.userService.getAllUserIds();
    console.log(allUserIds);
    console.log(allUserIds.length);
    for (const [idx, userId] of allUserIds.entries()) {
      // simulate 0-3 games against bot
      repeats = Math.floor(Math.random() * 2); //4
      for (let i = 0; i < repeats; i++) {
        const gameStatus = this.gameService.simulateGame(userId, Opponent.BOT);
        console.log(gameStatus);
        await this.gameService.createGame(gameStatus);
        await this.statsService.updateStats(gameStatus);
      }
      let idxOpp = idx + 1;
      while (idxOpp < allUserIds.length) {
        // simulate 1-7 games against other userIds
        repeats = Math.floor(Math.random() * 2) + 1; //7
        for (let i = 0; i < repeats; i++) {
          const gameStatus = this.gameService.simulateGame(
            userId,
            allUserIds[idxOpp],
          );
          console.log(gameStatus);
          await this.gameService.createGame(gameStatus);
          await this.statsService.updateStats(gameStatus);
        }
        idxOpp++;
      }
    }
    return allUserIds;
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
