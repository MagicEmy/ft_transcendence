import { UserStatusEnum } from 'src/enum/kafka.enum';

export class ProfileDto {
  userInfo: UserIdNameStatusDto;
  friends: UserIdNameStatusDto[];
  leaderboardPosition: number;
  totalPlayers: number;
  gamesAgainstHuman: GameStatsDto;
  gamesAgainstBot: GameStatsDto;
  mostFrequentOpponent: MostFrequentOpponentDto[];
}

export class UserIdNameStatusDto {
  userId: string;
  userName: string;
  status: UserStatusEnum;
}

export class GameStatsDto {
  totalPlayedGames: number;
  wins: number;
  losses: number;
  draws: number;
  maxScore: number;
  totalTimePlayed: TotalTimePlayedDto;
}

export class TotalTimePlayedDto {
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export class MostFrequentOpponentDto {
  userId: string;
  userName: string;
  games: number;
}
