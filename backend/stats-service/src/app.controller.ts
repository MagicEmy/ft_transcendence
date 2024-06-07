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
import { PositionTotalPointsDto } from './stats/dto/position-total-points-dto';

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
    try {
      const positionAndPoints =
        await this.statsService.getPositionAndTotalPoints(data.playerID);
      return of({
        playerID: data.playerID,
        playerRank: positionAndPoints.position,
      });
    } catch (error) {
      throw error;
    }
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

  @MessagePattern('getPositionAndTotalPoints')
  async getPositionAndTotalPoints(
    userId: string,
  ): Promise<Observable<PositionTotalPointsDto>> {
    return of(await this.statsService.getPositionAndTotalPoints(userId));
  }
}
