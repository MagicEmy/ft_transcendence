export interface LeaderboardStats {
  userId: string;
  userName?: string;
  wins: number;
  losses: number;
  draws: number;
  pointsTotal: number;
  rank?: number;
}
