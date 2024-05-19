import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NewUserDto } from '../dto/new-user-dto';
import { StatsRepository } from './stats.repository';
import { UpdateStatsDto } from '../dto/update-stats-dto';
import { Opponent } from '../utils/opponent.enum';
import { Stats } from './stats.entity';
import {
  MILISECONDS_IN_A_DAY,
  MILISECONDS_IN_AN_HOUR,
  MILISECONDS_IN_A_MINUTE,
  MILISECONDS_IN_A_SECOND,
  DAYS_IN_A_WEEK,
} from '../utils/constants';
import { GameStatsDto, TotalTimePlayedDto } from 'src/dto/profile-dto';
import { LeaderboardStatsDto } from '../dto/leaderboard-stats-dto';
import { UserService } from 'src/user/user.service';
import { IGameStatus } from 'src/utils/kafka.interface';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(StatsRepository)
    private readonly statsRepository: StatsRepository,
    private readonly userService: UserService,
  ) {}

  async updateStats(gameStatus: IGameStatus): Promise<void> {
    const { player1ID, player2ID, player1Score, player2Score } = gameStatus; // duration to be added
    const duration = gameStatus.player1Score * gameStatus.player2Score * 1111;
    const player1 = {
      player_id: player1ID,
      //   opponent: player2_id ? Opponent.HUMAN : Opponent.BOT,
      opponent: player2ID != Opponent.BOT ? Opponent.HUMAN : Opponent.BOT,
      score: +player1Score,
      result:
        player1Score === player2Score
          ? 0
          : (player1Score - player2Score) /
            Math.abs(player1Score - player2Score),
      duration: +duration,
    };
    await this.updateStatsOfPlayer(player1);
    // if (player2ID) {
    if (player2ID != Opponent.BOT) {
      const player2 = {
        player_id: player2ID,
        opponent: Opponent.HUMAN,
        score: +player2Score,
        result:
          player1Score === player2Score
            ? 0
            : (player2Score - player1Score) /
              Math.abs(player2Score - player1Score),
        duration: +duration,
      };
      await this.updateStatsOfPlayer(player2);
    }
  }

  async getStatsRowByIdAndOpponent(
    player_id: string,
    opponent: Opponent,
  ): Promise<Stats> {
    return await this.statsRepository.findOneBy({
      user_id: player_id,
      opponent: opponent,
    });
  }

  recalculatePlayingTime(
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

  async updateStatsOfPlayer(updateStatsDto: UpdateStatsDto): Promise<void> {
    const statsRow = await this.getStatsRowByIdAndOpponent(
      updateStatsDto.player_id,
      updateStatsDto.opponent,
    );
    if (!statsRow) {
      console.log(
        `Couldn't find stats row with player_id ${updateStatsDto.player_id} and opponent ${updateStatsDto.opponent}`,
      );
    } else {
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
        case -1:
          statsRow.losses += 1;
          break;
        case 0:
          statsRow.draws += 1;
          break;
        case 1:
          statsRow.wins += 1;
      }
      statsRow.points_total = statsRow.wins * 3 + statsRow.draws;
    }
    await this.statsRepository.save(statsRow);
  }

  async createStatsRowNewUser(newUserDto: NewUserDto): Promise<void> {
    this.statsRepository.createStatsRowNewUser(newUserDto);
  }

  getTotalTimePlayed(days: number, miliseconds: number): TotalTimePlayedDto {
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

  async getGamesAgainst(
    user_id: string,
    opponent: Opponent,
  ): Promise<GameStatsDto> {
    const statsRow: Stats = await this.getStatsRowByIdAndOpponent(
      user_id,
      opponent,
    );
    const totalTimePlayed: TotalTimePlayedDto = this.getTotalTimePlayed(
      statsRow.total_time_playing_days,
      statsRow.total_time_playing_miliseconds,
    );
    return {
      total_played_games: statsRow.wins + statsRow.losses + statsRow.draws,
      wins: statsRow.wins,
      losses: statsRow.losses,
      draws: statsRow.draws,
      max_score: statsRow.max_score,
      total_time_played: totalTimePlayed,
    };
  }

  calculateLeaderboardRanks(
    leaderboard: LeaderboardStatsDto[],
  ): LeaderboardStatsDto[] {
    let previousPointValue: number = Number.MAX_SAFE_INTEGER;
    let previousRank: number = 0;
    for (const [idx, item] of leaderboard.entries()) {
      item.rank =
        previousPointValue > item.points_total ? idx + 1 : previousRank;
      previousPointValue = item.points_total;
      previousRank = item.rank;
    }
    return leaderboard;
  }

  async createLeaderboard(options: {
    user_names: boolean;
  }): Promise<LeaderboardStatsDto[]> {
    const queryResult: LeaderboardStatsDto[] =
      await this.statsRepository.getStatsForLeaderboard();
    const leaderboard = this.calculateLeaderboardRanks(queryResult);
    if (options.user_names) {
      for (const item of leaderboard) {
        const user_name = await this.userService.getUsername(item.user_id);
        item.user_name = user_name;
      }
    }
    return leaderboard;
  }

  async getRank(userId: string): Promise<number> {
    const result = await this.statsRepository
      .createQueryBuilder('stats')
      .select('points_total')
      .where('user_id LIKE :userId', { userId })
      .andWhere('opponent LIKE :opponent', { opponent: Opponent.HUMAN })
      .getRawOne();
    const rank = await this.statsRepository
      .createQueryBuilder('stats')
      .where('opponent LIKE :opponent', { opponent: Opponent.HUMAN })
      .andWhere('points_total > :points', { points: result.points_total })
      .getCount();
    return rank + 1;
  }
}
