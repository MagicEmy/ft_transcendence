import { Opponent } from '../utils/opponent.enum';

export class UpdateStatsDto {
  player_id: string;
  opponent: Opponent;
  score: number;
  won: boolean;
  lost: boolean;
  duration: number;
}
