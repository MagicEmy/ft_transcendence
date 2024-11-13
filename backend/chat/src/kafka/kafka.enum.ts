export enum UserStatusEnum {
  CHAT = 'chatting',
  GAME = 'playing',
  OFFLINE = 'offline',
  ONLINE = 'online',
}

export enum KafkaTopic {
  NEW_GAME = 'NewGame',
  NEW_USER = 'new_user',
  USERNAME_CHANGE = 'username_change',
  STATUS_CHANGE = 'status_change',
  GAME_END = 'game_end',
  GAME_FOR_USER = 'game_for_user',
}

export interface INewGame {
  gameType: GameTypes; //GameTypes.PONG
  matchType: MatchTypes; //MatchTypes.PAIR
  player1ID: string;
  player2ID: string;
}

export enum GameTypes {
  PONG = 'pong',
}

export enum MatchTypes {
  SOLO = 'solo',
  LOCAL = 'local',
  PAIR = 'pair',
  MATCH = 'match',
}

export enum GameStatus {
  BADGAME = 'invalid_game',
  NOCONNECT = 'missing_player',
  INTERRUPTED = 'interrupted',
  COMPLETED = 'completed',
}
