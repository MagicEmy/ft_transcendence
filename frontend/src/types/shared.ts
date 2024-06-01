
export interface User {
	userId?: string;
	userName?: string;
}


export interface UserProfile {
	userInfo: {
		userId?: string,
		userName: string,
		status: string
	  },
	friends: Friends,
	leaderboardPosition: number,
	totalPlayers: number,
	gamesAgainstBot: {
		totalPlayedGames: number,
		wins: number,
		losses: number,
		draws: number,
		maxScore: number,
		totalTimePlayed: {
		weeks: number,
		days: number,
		hours: number,
		minutes: number,
		seconds: number
		}
	},
	gamesAgainstHuman: {
		totalPlayedGames: number,
		wins: number,
		losses: number,
		draws: number,
		maxScore: number,
		totalTimePlayed: {
		weeks: number,
		days: number,
		hours: number,
		minutes: number,
		seconds: number
		}
	},
	mostFrequentOpponent: [
		{
		userId: string,
		userName: string,
		games: string
		}
	]
  }

  export interface Friends {
	userId: string;
	userName: string;
	status: string;
  }

  export interface UserStatus {
	status?: string;
  }
