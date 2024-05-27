import { Opponent } from '../enum/opponent.enum';

export class GamesAgainstUserIdDto {
  userId: string;
  games: number;
}

export class UserIdOpponentDto {
  userId: string;
  opponent: Opponent;
}
