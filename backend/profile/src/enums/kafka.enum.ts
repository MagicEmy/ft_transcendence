export enum UserStatusEnum {
  CHAT_ONLINE = 'chat_online',
  CHAT_OFFLINE = 'chat_offline',
  ONLINE = 'online',
  GAME = 'game',
  OFFLINE = 'offline',
}

// IN CHAT:
// export enum UserStatusEnum {
//   CHAT_ONLINE = 'chat_online',
//   CHAT_OFFLINE = 'chat_offline',
// }

export enum KafkaTopic {
  NEW_USER = 'new_user',
  USERNAME_CHANGE = 'username_change',
  STATUS_CHANGE = 'status_change',
}

// export interface INewGame {
//   gameType: GameTypes; //GameTypes.PONG
//   matchType: MatchTypes; //MatchTypes.PAIR
//   player1ID: string;
//   player2ID: string;
// }

export enum GameTypes {
  PONG = 'pong',
}

export enum MatchTypes {
  SOLO = 'solo',
  LOCAL = 'local',
  PAIR = 'pair',
  MATCH = 'match',
}

export enum PlayerInfo {
  TOPIC = 'requestPlayerInfo',
  REPLY = 'sendPlayerInfo',
}

export enum GameStatus {
  TOPIC = 'game_end',
  BADGAME = 'invalid_game',
  NOCONNECT = 'missing_player',
  INTERRUPTED = 'interrupted',
  COMPLETED = 'completed',
}
