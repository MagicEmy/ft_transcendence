import { UserStatusEnum } from 'src/utils/user-status.enum';

export class ProfileDto {
  user_info: UserInfoDto;
  avatar?: Buffer;
  friends: FriendDto[];
  leaderboard_position: number;
  total_players: number;
  games_against_human: GameStatsDto;
  games_against_bot: GameStatsDto;
  most_frequent_opponent: MostFrequentOpponentDto[];
}

export class UserInfoDto {
  user_id: string;
  user_name: string;
  status: UserStatusEnum;
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
  status: UserStatusEnum;
}

export class MostFrequentOpponentDto {
  user_id: string;
  user_name: string;
  games: number;
}
