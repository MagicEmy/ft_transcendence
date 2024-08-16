export interface User {
  userId?: string;
  userName?: string;
}

export interface UserProfile {
  userInfo: {
    userId?: string;
    userName: string;
    status: string;
  };
  friends: Friends;
  leaderboard: {
    position: number;
    totalPoints: number;
  };
  totalPlayers: number;
  gamesAgainstBot: {
    totalPlayedGames: number;
    wins: number;
    losses: number;
    draws: number;
    maxScore: number;
    totalTimePlayed: {
      weeks: number;
      days: number;
      hours: number;
      minutes: number;
      seconds: number;
    };
  };
  gamesAgainstHuman: {
    totalPlayedGames: number;
    wins: number;
    losses: number;
    draws: number;
    maxScore: number;
    totalTimePlayed: {
      weeks: number;
      days: number;
      hours: number;
      minutes: number;
      seconds: number;
    };
  };
  mostFrequentOpponent: [
    {
      userId: string;
      userName: string;
      games: string;
    },
  ];
}

export interface Friends {
  userId: string;
  userName: string;
  status: string;
}

export interface UserStatus {
  status?: string;
}

export interface Games {
  gameId: number;
  player1Id: string;
  player1Name?: string;
  player1Score: number;
  player2Id: string;
  player2Name?: string;
  player2Score: number;
}
