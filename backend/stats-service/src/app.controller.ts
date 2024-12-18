import { Controller } from '@nestjs/common';
import { StatsService } from './stats/stats.service';
import { GameStatus, KafkaTopic, PlayerInfo } from './stats/enum/kafka.enum';
import { IGameStatus } from './stats/interface/kafka.interface';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { UserIdNameLoginDto } from './stats/dto/user-id-name-login-dto';
import { UserIdOpponentDto } from './stats/dto/games-against-dto';
import { GameStatsDto } from './stats/dto/game-stats-dto';
import { Observable, of } from 'rxjs';
import { LeaderboardStatsDto } from './stats/dto/leaderboard-stats-dto';
import { PositionTotalPointsDto } from './stats/dto/position-total-points-dto';

@Controller()
export class AppController {
  constructor(private readonly statsService: StatsService) {}

  // Kafka-related methods

  @EventPattern(KafkaTopic.GAME_END) // CHECKED
  handleGameEnd(data: IGameStatus): Promise<void> {
    return this.statsService.updateStats(data);
  }

  @EventPattern(KafkaTopic.NEW_USER) //CHECKED
  createStatsRowNewUser(data: UserIdNameLoginDto): Promise<void> {
    try {
      this.statsService.createStatsRowNewUser(data.userId);
      return;
    } catch (error) {
      throw error;
    }
  }

  @EventPattern(PlayerInfo.TOPIC) //CHECKED
  async handlePlayerInfoRequest(data: any): Promise<void> {
    try {
      const positionAndPoints =
        await this.statsService.getPositionAndTotalPoints(data.playerID);
      this.statsService.announcePlayerRank({
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
    try {
      const result = await this.statsService.getGamesAgainst(data);
      return of(result);
    } catch (error) {
      throw error;
    }
  }

  @MessagePattern('getLeaderboard')
  async getLeaderboard(): Promise<Observable<LeaderboardStatsDto[]>> {
    try {
      const result = await this.statsService.createLeaderboard();
      return of(result);
    } catch (error) {
      throw error;
    }
  }

  @MessagePattern('getPositionAndTotalPoints')
  async getPositionAndTotalPoints(
    userId: string,
  ): Promise<Observable<PositionTotalPointsDto>> {
    try {
      const result = await this.statsService.getPositionAndTotalPoints(userId);
      return of(result);
    } catch (error) {
      throw error;
    }
  }
}
