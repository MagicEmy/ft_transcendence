import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GameEndDto } from '../dto/game-end-dto';
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
import { LeaderboardQueryResultDto } from '../dto/leaderboard-query-result-dto';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(StatsRepository)
    private readonly statsRepository: StatsRepository,
    private readonly userService: UserService,
  ) {}

  async updateStats(gameEndDto: GameEndDto): Promise<void> {
    const { player1_id, player2_id, player1_score, player2_score, duration } =
      gameEndDto;
    console.log(gameEndDto);
    const pl1 = {
      player_id: player1_id,
      //   opponent: player2_id ? Opponent.HUMAN : Opponent.BOT,
      opponent: player2_id != Opponent.BOT ? Opponent.HUMAN : Opponent.BOT,
      score: +player1_score,
      result:
        player1_score === player2_score
          ? 0
          : (player1_score - player2_score) /
            Math.abs(player1_score - player2_score),
      duration: +duration,
    };
    console.log(pl1);
    await this.updateStatsOfPlayer(pl1);
    // if (player2_id) {
    if (player2_id != Opponent.BOT) {
      const pl2 = {
        player_id: player2_id,
        opponent: Opponent.HUMAN,
        score: +player2_score,
        result:
          player1_score === player2_score
            ? 0
            : (player2_score - player1_score) /
              Math.abs(player2_score - player1_score),
        duration: +duration,
      };
      console.log(pl2);
      await this.updateStatsOfPlayer(pl2);
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

  calculateLeaderboardPoints(
    queryResult: LeaderboardQueryResultDto[],
  ): LeaderboardStatsDto[] {
    const leaderboard = [];
    for (const item of queryResult) {
      leaderboard.push({
        user_id: item.user_id,
        wins: item.wins,
        losses: item.losses,
        draws: item.draws,
        points: item.wins * 3 + item.draws,
      });
    }
    return leaderboard;
  }

  calculateLeaderboardRanks(
    leaderboard: LeaderboardStatsDto[],
  ): LeaderboardStatsDto[] {
    let previousPointValue: number = Number.MAX_SAFE_INTEGER;
    let previousRank: number = 0;
    for (const [idx, item] of leaderboard.entries()) {
      item.rank = previousPointValue > item.points ? idx + 1 : previousRank;
      previousPointValue = item.points;
      previousRank = item.rank;
    }
    return leaderboard;
  }

  async createLeaderboard(options: {
    user_names: boolean;
  }): Promise<LeaderboardStatsDto[]> {
    const queryResult = await this.statsRepository.getStatsForLeaderboard();
    let leaderboard = this.calculateLeaderboardPoints(queryResult);
    leaderboard.sort((a, b) => b.points - a.points);
    leaderboard = this.calculateLeaderboardRanks(leaderboard);
    if (options.user_names) {
      for (const item of leaderboard) {
        const user_name = await this.userService.getUsername(item.user_id);
        item.user_name = user_name;
      }
    }
    return leaderboard;
  }
}
