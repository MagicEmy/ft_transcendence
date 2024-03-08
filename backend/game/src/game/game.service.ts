import { Inject, Injectable } from '@nestjs/common';
import { SingleGameStartDto } from './dto/single-game-start-dto';
import { ClientKafka } from '@nestjs/microservices';
import { DoubleGameStartDto } from './dto/double-game-start-dto';
import { SingleGameEndDto } from './dto/single-game-end-dto';
import { DoubleGameEndDto } from './dto/double-game-end-dto';

@Injectable()
export class GameService {
  constructor(
    @Inject('STATS_SERVICE') private readonly statsClient: ClientKafka,
  ) {}

  announceSingleGameStart({
    game_id,
    player_id,
    game_start,
  }: SingleGameStartDto): void {
    this.statsClient.emit('single_game_start', {
      game_id,
      player_id,
      game_start,
    });
  }

  announceSingleGameEnd({ game_id, game_end, score }: SingleGameEndDto): void {
    this.statsClient.emit('single_game_end', {
      game_id,
      game_end,
      score,
    });
  }

  announceDoubleGameStart({
    game_id,
    left_player_id,
    right_player_id,
    game_start,
  }: DoubleGameStartDto): void {
    this.statsClient.emit('double_game_start', {
      game_id,
      left_player_id,
      right_player_id,
      game_start,
    });
  }

  announceDoubleGameEnd({
    game_id,
    game_end,
    left_score,
    right_score,
  }: DoubleGameEndDto): void {
    this.statsClient.emit('double_game_end', {
      game_id,
      game_end,
      left_score,
      right_score,
    });
  }
}
