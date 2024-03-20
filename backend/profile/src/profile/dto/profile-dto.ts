export class ProfileDto {
  user_id: string;
  user_name: string;
  avatar: Buffer;
  friends: string[];
  leaderboard_position: number;
  total_players: number;

  games_against_bot: {
    total_played_games: number;
    wins: number;
    losses: number;
    draws: number;
    max_score: number;
    total_time_played: {
      days: number;
      hours: number;
      minutes: number;
      seconds: number;
    };
    most_frequent_opponent: string;
  };

  games_against_human: {
    total_played_games: number;
    wins: number;
    losses: number;
    draws: number;
    max_score: number;
    total_time_played: {
      days: number;
      hours: number;
      minutes: number;
      seconds: number;
    };
  };
}
