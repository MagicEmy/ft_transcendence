import { Opponent } from '../enum/opponent.enum';

export class GamesAgainstUserIdDto {
  userId: string | null;
  totalGames: number;
}

export class UserIdOpponentDto {
  userId: string;
  opponent: Opponent;
}
