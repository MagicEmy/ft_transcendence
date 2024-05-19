import { GameStatus, GameTypes, MatchTypes } from './kafka.enum';

export interface IGameStatus {
  gameType: GameTypes; //GameTypes.PONG
  matchType: MatchTypes;
  status: GameStatus;
  player1ID: string;
  player1Score: number;
  player2ID: string | null;
  player2Score: number;
}

export interface IPlayerInfo {
  playerID: string;
  playerName?: string;
  playerRank?: number;
}
