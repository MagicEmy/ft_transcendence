import { GameResult } from 'src/utils/game-result.enum';
import { Opponent } from '../utils/opponent.enum';

export class UpdateStatsDto {
  player_id: string;
  opponent: Opponent;
  score: number;
  result: GameResult;
  duration: number;
}
