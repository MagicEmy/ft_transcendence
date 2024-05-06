import { GameStatus } from '../utils/game-status.enum';

export class GameEndDto {
  player1_id: string;
  player2_id: string;
  player1_score: number;
  player2_score: number;
  duration: number; // duration of the game in ms
  status: GameStatus;
}
