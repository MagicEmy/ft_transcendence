export class LeaderboardStatsDto {
  userId: string;
  userName?: string;
  wins: number;
  losses: number;
  draws: number;
  pointsTotal: number;
  rank?: number;
}
