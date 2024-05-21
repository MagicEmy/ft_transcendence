import { GameResult } from 'src/enums/game-result.enum';
import { Opponent } from '../enums/opponent.enum';

export class UpdateStatsDto {
  player_id: string;
  opponent: Opponent;
  score: number;
  result: GameResult;
  duration: number;
}
