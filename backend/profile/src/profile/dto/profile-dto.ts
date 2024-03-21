export class ProfileDto {
  user_id: string;
  user_name: string;
  avatar: Buffer;
  friends: FriendDto[];
  leaderboard_position: number;
  total_players: number;
  games_against_human: GameStatsDto;
  games_against_bot: GameStatsDto;
  most_frequent_opponent: string;
}

export class GameStatsDto {
  total_played_games: number;
  wins: number;
  losses: number;
  draws: number;
  max_score: number;
  total_time_played: TotalTimePlayedDto;
}

export class TotalTimePlayedDto {
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export class FriendDto {
  user_id: string;
  user_name: string;
}
