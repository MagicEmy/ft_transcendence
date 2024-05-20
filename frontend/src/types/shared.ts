// src/types/shared.ts

export interface User {
	user_id: string;
	user_name: string;
}


export interface UserProfile {
	user_id: string;
	user_name: string;
	leaderboard_position?: number;
	total_players?: number;
	most_frequent_opponent?: { user_id: string; user_name: string }[];
	games_against_human?: {
	  total_played_games: number;
	  max_score: number;
	  wins: number;
	  draws: number;
	  losses: number;
	  total_time_played: {
		weeks: number;
		days: number;
		hours: number;
		minutes: number;
		seconds: number;
	  };
	};
	games_against_bot?: {
	  total_played_games: number;
	  max_score: number;
	  wins: number;
	  draws: number;
	  losses: number;
	  total_time_played: {
		weeks: number;
		days: number;
		hours: number;
		minutes: number;
		seconds: number;
	  };
	};
  }
  
  export interface Friends {
	user_id: string;
	user_name: string;
	status: string;
  }
  
  
  