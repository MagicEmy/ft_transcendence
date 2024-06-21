export enum UserStatusEnum {
  CHAT_ONLINE = 'chatting',
  CHAT_OFFLINE = 'chat_offline',
  ONLINE = 'online',
  GAME = 'playing',
  OFFLINE = 'offline',
}

export enum KafkaTopic {
  NEW_GAME = 'NewGame',
  NEW_USER = 'new_user',
  USERNAME_CHANGE = 'username_change',
  STATUS_CHANGE = 'status_change',
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
