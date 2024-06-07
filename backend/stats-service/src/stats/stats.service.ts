import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StatsRepository } from './stats.repository';
import { UpdateStatsDto } from './dto/update-stats-dto';
import { Opponent } from './enum/opponent.enum';
import { Stats } from './stats.entity';
import {
  MILISECONDS_IN_A_DAY,
  MILISECONDS_IN_AN_HOUR,
  MILISECONDS_IN_A_MINUTE,
  MILISECONDS_IN_A_SECOND,
  DAYS_IN_A_WEEK,
} from '../constants';
import { GameStatsDto, TotalTimePlayedDto } from './dto/game-stats-dto';
import { LeaderboardStatsDto } from './dto/leaderboard-stats-dto';
import { IGameStatus } from './interface/kafka.interface';
import { GameResult } from './enum/game-result.enum';
import { UserIdOpponentDto } from './dto/games-against-dto';
import { RpcException } from '@nestjs/microservices';
import { PositionTotalPointsDto } from './dto/position-total-points-dto';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(StatsRepository)
    private readonly statsRepository: StatsRepository,
  ) {}

  //   Kafka-related methods

  async createStatsRowNewUser(userId: string): Promise<void> {
    return this.statsRepository.createStatsRowNewUser(userId);
  }

  async updateStats(gameStatus: IGameStatus): Promise<void> {
    const { player1ID, player2ID, player1Score, player2Score, duration } =
      gameStatus;
    const player1 = {
      playerId: player1ID,
      opponent: player2ID ? Opponent.HUMAN : Opponent.BOT,
      score: +player1Score,
      result:
        player1Score === player2Score
          ? GameResult.DRAW
          : player1Score > player2Score
            ? GameResult.WIN
            : GameResult.LOSS,
      duration: +duration,
    };
    try {
      await this.updateStatsOfPlayer(player1);
    } catch (error) {
      throw error;
    }
    if (player2ID) {
      const player2 = {
        playerId: player2ID,
        opponent: Opponent.HUMAN,
        score: +player2Score,
        result:
          player1Score === player2Score
            ? GameResult.DRAW
            : player2Score > player1Score
              ? GameResult.WIN
              : GameResult.LOSS,
        duration: +duration,
      };
      try {
        await this.updateStatsOfPlayer(player2);
      } catch (error) {
        throw error;
      }
    }
  }

  async updateStatsOfPlayer(updateStatsDto: UpdateStatsDto): Promise<void> {
    const statsRow = await this.getStatsRowByIdAndOpponent({
      userId: updateStatsDto.playerId,
      opponent: updateStatsDto.opponent,
    });
    if (!statsRow) {
      throw new RpcException(
        new NotFoundException(
          `Couldn't find stats row with player_id ${updateStatsDto.playerId} and opponent ${updateStatsDto.opponent}`,
        ),
      );
    }
    statsRow.max_score =
      updateStatsDto.score > statsRow.max_score
        ? updateStatsDto.score
        : statsRow.max_score;
    const recalculated = this.recalculatePlayingTime(
      statsRow.total_time_playing_days,
      statsRow.total_time_playing_miliseconds,
      updateStatsDto.duration,
    );
    statsRow.total_time_playing_days = recalculated.days;
    statsRow.total_time_playing_miliseconds = recalculated.miliseconds;
    switch (updateStatsDto.result) {
      case GameResult.LOSS:
        statsRow.losses += 1;
        break;
      case GameResult.DRAW:
        statsRow.draws += 1;
        break;
      case GameResult.WIN:
        statsRow.wins += 1;
    }
    statsRow.points_total += updateStatsDto.result;
    try {
      await this.statsRepository.save(statsRow);
    } catch (error) {
      throw new RpcException(new InternalServerErrorException());
    }
  }

  private async getStatsRowByIdAndOpponent(
    userIdOpponentDto: UserIdOpponentDto,
  ): Promise<Stats> {
    return await this.statsRepository.findOneBy({
      user_id: userIdOpponentDto.userId,
      opponent: userIdOpponentDto.opponent,
    });
  }

  private recalculatePlayingTime(
    days: number,
    miliseconds: number,
    duration: number,
  ): { days: number; miliseconds: number } {
    miliseconds += duration;
    if (miliseconds > MILISECONDS_IN_A_DAY) {
      days += Math.floor(miliseconds / MILISECONDS_IN_A_DAY);
      miliseconds = miliseconds % MILISECONDS_IN_A_DAY;
    }
    return { days, miliseconds };
  }

  // Gateway-related methods

  async createLeaderboard(): Promise<LeaderboardStatsDto[]> {
    const queryResult: LeaderboardStatsDto[] =
      await this.statsRepository.getStatsForLeaderboard();
    const leaderboard = this.calculateLeaderboardRanks(queryResult);
    return leaderboard;
  }

  private calculateLeaderboardRanks(
    leaderboard: LeaderboardStatsDto[],
  ): LeaderboardStatsDto[] {
    let previousPointValue: number = Number.MAX_SAFE_INTEGER;
    let previousRank: number = 0;
    for (const [idx, item] of leaderboard.entries()) {
      item.rank =
        previousPointValue > item.pointsTotal ? idx + 1 : previousRank;
      previousPointValue = item.pointsTotal;
      previousRank = item.rank;
    }
    return leaderboard;
  }

  async getGamesAgainst(
    userIdOpponentDto: UserIdOpponentDto,
  ): Promise<GameStatsDto> {
    const statsRow: Stats =
      await this.getStatsRowByIdAndOpponent(userIdOpponentDto);
    if (!statsRow) {
      throw new RpcException(
        new NotFoundException(
          `Couldn't find stats row with player_id ${userIdOpponentDto.userId} and opponent ${userIdOpponentDto.opponent}`,
        ),
      );
    }
    const totalTimePlayed: TotalTimePlayedDto = this.getTotalTimePlayed(
      statsRow.total_time_playing_days,
      statsRow.total_time_playing_miliseconds,
    );
    return {
      totalPlayedGames: statsRow.wins + statsRow.losses + statsRow.draws,
      wins: statsRow.wins,
      losses: statsRow.losses,
      draws: statsRow.draws,
      maxScore: statsRow.max_score,
      totalTimePlayed: totalTimePlayed,
    };
  }

  private getTotalTimePlayed(
    days: number,
    miliseconds: number,
  ): TotalTimePlayedDto {
    const totalTimePlayed = new TotalTimePlayedDto();
    totalTimePlayed.weeks = Math.floor(days / DAYS_IN_A_WEEK);
    totalTimePlayed.days = days % DAYS_IN_A_WEEK;
    totalTimePlayed.hours = Math.floor(miliseconds / MILISECONDS_IN_AN_HOUR);
    miliseconds -= totalTimePlayed.hours * MILISECONDS_IN_AN_HOUR;
    totalTimePlayed.minutes = Math.floor(miliseconds / MILISECONDS_IN_A_MINUTE);
    miliseconds -= totalTimePlayed.minutes * MILISECONDS_IN_A_MINUTE;
    totalTimePlayed.seconds = Math.round(miliseconds / MILISECONDS_IN_A_SECOND);
    return totalTimePlayed;
  }

  async getPositionAndTotalPoints(
    userId: string,
  ): Promise<PositionTotalPointsDto> {
    const result = await this.statsRepository
      .createQueryBuilder('stats')
      .select('points_total', 'pointsTotal')
      .where('user_id LIKE :userId', { userId })
      .andWhere('opponent LIKE :opponent', { opponent: Opponent.HUMAN })
      .getRawOne();
    if (!result) {
      throw new RpcException(
        new NotFoundException(`User with id ${userId} not found`),
      );
    }
    const rank = await this.statsRepository
      .createQueryBuilder('stats')
      .where('opponent LIKE :opponent', { opponent: Opponent.HUMAN })
      .andWhere('points_total > :points', { points: result.pointsTotal })
      .getCount();
    return {
      position: rank + 1,
      totalPoints: result.pointsTotal,
    };
  }
}
