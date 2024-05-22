
export interface User {
	user_id?: string;
	user_name?: string;
}


export interface UserProfile {
	user_info: {
		user_id?: string,
		user_name: string,
		status: string
	  },
	friends: Friends[],
	leaderboard_position: number,
	total_players: number,
	games_against_bot: {
		total_played_games: number,
		wins: number,
		losses: number,
		draws: number,
		max_score: number,
		total_time_played: {
		weeks: number,
		days: number,
		hours: number,
		minutes: number,
		seconds: number
		}
	},
	games_against_human: {
		total_played_games: number,
		wins: number,
		losses: number,
		draws: number,
		max_score: number,
		total_time_played: {
		weeks: number,
		days: number,
		hours: number,
		minutes: number,
		seconds: number
		}
	},
	most_frequent_opponent: [
		{
		user_id: string,
		user_name: string,
		games: string
		}
	]	
  }
  
  export interface Friends {
	user_id: string;
	user_name: string;
	status: string;
  }
  
  