import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GameEndDto } from '../game/dto/game-end-dto';
import { NewUserDto } from './dto/new-user-dto';
import { StatsRepository } from './stats.repository';
import { UpdateStatsDto } from './dto/update-stats-dto';
import { Opponent } from './opponent.enum';
import { Stats } from './stats.entity';
import {
  MILISECONDS_IN_A_DAY,
  MILISECONDS_IN_AN_HOUR,
  MILISECONDS_IN_A_MINUTE,
  MILISECONDS_IN_A_SECOND,
  DAYS_IN_A_WEEK,
} from './constants';
import { GameStatsDto, TotalTimePlayedDto } from 'src/profile/dto/profile-dto';
import { LeaderboardStatsDto } from './dto/leaderboard-stats-dto';
import { UserService } from 'src/user/user.service';
import { LeaderboardQueryResultDto } from './dto/leaderboard-query-result-dto';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(StatsRepository)
    private readonly statsRepository: StatsRepository,
    private readonly userService: UserService,
  ) {}

  async handleGameEnd(gameEndDto: GameEndDto): Promise<void> {
    const { player1_id, player2_id, player1_score, player2_score, duration } =
      gameEndDto;
    const player1 = {
      player_id: player1_id,
      opponent: Opponent.HUMAN,
      score: +player1_score,
      won: player1_score > player2_score ? true : false,
      lost: player1_score < player2_score ? true : false,
      duration: +duration,
    };
    const player2 = {
      player_id: player2_id,
      opponent: Opponent.HUMAN,
      score: +player2_score,
      won: player2_score > player1_score ? true : false,
      lost: player2_score < player1_score ? true : false,
      duration: +duration,
    };
    if (
      gameEndDto.player1_id !== Opponent.BOT &&
      gameEndDto.player2_id !== Opponent.BOT
    ) {
      await this.updateStatsAfterGameEnd(player1);
      await this.updateStatsAfterGameEnd(player2);
    } else if (gameEndDto.player1_id !== Opponent.BOT) {
      player1.opponent = Opponent.BOT;
      await this.updateStatsAfterGameEnd(player1);
    } else {
      player2.opponent = Opponent.BOT;
      await this.updateStatsAfterGameEnd(player2);
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

  async updateStatsAfterGameEnd(updateStatsDto: UpdateStatsDto): Promise<void> {
    console.log('in updateStatsAfterGameEnd');
    console.log(updateStatsDto);
    const statsRow = await this.getStatsRowByIdAndOpponent(
      updateStatsDto.player_id,
      updateStatsDto.opponent,
    );
    if (!statsRow) {
      console.log(
        `Couldn't find stats row with player_id ${updateStatsDto.player_id} and opponent ${updateStatsDto.opponent}`,
      );
    } else {
      console.log(statsRow);
      statsRow.games_played += 1;
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
      statsRow.wins = updateStatsDto.won ? statsRow.wins + 1 : statsRow.wins;
      statsRow.losses = updateStatsDto.lost
        ? statsRow.losses + 1
        : statsRow.losses;
    }
    await this.statsRepository.save(statsRow);
    console.log('Saved in database:');
    console.log(statsRow);
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
      total_played_games: statsRow.games_played,
      wins: statsRow.wins,
      losses: statsRow.losses,
      draws: statsRow.games_played - (statsRow.wins + statsRow.losses),
      max_score: statsRow.max_score,
      total_time_played: totalTimePlayed,
    };
  }

  calculateLeaderboardPoints(
    queryResult: LeaderboardQueryResultDto[],
  ): LeaderboardStatsDto[] {
    const leaderboard = [];
    for (const item of queryResult) {
      const draws = item.games_played - (item.wins + item.losses);
      leaderboard.push({
        user_id: item.user_id,
        wins: item.wins,
        losses: item.losses,
        draws: draws,
        points: item.wins * 3 + draws,
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
