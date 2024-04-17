import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { GameEndDto } from './dto/game-end-dto';

@Injectable()
export class GameService {
  constructor(
    @Inject('STATS_SERVICE') private readonly statsClient: ClientKafka,
  ) {}

  announceGameEnd(gameEndDto: GameEndDto): void {
    const {player1_id, player2_id, player1_score, player2_score, duration, status} = gameEndDto;

    this.statsClient.emit('game_end', {
      player1_id,
      player2_id,
      player1_score,
      player2_score,
      duration,
      status,
    });
  }
}
