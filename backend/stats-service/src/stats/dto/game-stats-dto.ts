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
