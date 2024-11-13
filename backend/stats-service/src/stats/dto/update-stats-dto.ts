import { GameResult } from '../enum/game-result.enum';
import { Opponent } from '../enum/opponent.enum';

export class UpdateStatsDto {
  playerId: string;
  opponent: Opponent;
  score: number;
  result: GameResult;
  duration: number;
}
