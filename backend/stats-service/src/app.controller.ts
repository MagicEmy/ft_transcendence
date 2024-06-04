import { Controller } from '@nestjs/common';
import { StatsService } from './stats/stats.service';
import { GameStatus, KafkaTopic, PlayerInfo } from './stats/enum/kafka.enum';
import { IGameStatus, IPlayerInfo } from './stats/interface/kafka.interface';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { NewUserDto } from './stats/dto/new-user-dto';
import { UserIdOpponentDto } from './stats/dto/games-against-dto';
import { GameStatsDto } from './stats/dto/game-stats-dto';
import { Observable, of } from 'rxjs';
import { LeaderboardStatsDto } from './stats/dto/leaderboard-stats-dto';

@Controller()
export class AppController {
  constructor(private readonly statsService: StatsService) {}

  // Kafka-related methods

  @EventPattern(GameStatus.TOPIC) // CHECKED
  handleGameEnd(data: IGameStatus): Promise<void> {
    return this.statsService.updateStats(data);
  }

  @EventPattern(KafkaTopic.NEW_USER) //CHECKED
  createStatsRowNewUser(data: NewUserDto): Promise<void> {
    return this.statsService.createStatsRowNewUser(data.userId);
  }

  @MessagePattern(PlayerInfo.TOPIC) //CHECKED
  async handlePlayerInfoRequest(data: any): Promise<Observable<IPlayerInfo>> {
    return of({
      playerID: data.playerID,
      playerRank: await this.statsService.getRank(data.playerID),
    });
  }

  // Gateway-related methods

  @MessagePattern('getGamesAgainst')
  async getGamesAgainst(
    data: UserIdOpponentDto,
  ): Promise<Observable<GameStatsDto>> {
    return of(await this.statsService.getGamesAgainst(data));
  }

  @MessagePattern('getLeaderboard')
  async getLeaderboard(): Promise<Observable<LeaderboardStatsDto[]>> {
    return of(await this.statsService.createLeaderboard());
  }

  @MessagePattern('getRank')
  async getRank(userId: string): Promise<Observable<number>> {
    return of(await this.statsService.getRank(userId));
  }
}
