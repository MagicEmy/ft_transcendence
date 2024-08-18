export enum UserStatusEnum {
  CHAT = 'chatting',
  GAME = 'playing',
  OFFLINE = 'offline',
  ONLINE = 'online',
}

export enum KafkaTopic {
  NEW_USER = 'new_user',
  USERNAME_CHANGE = 'username_change',
  STATUS_CHANGE = 'status_change',
  GAME_END = 'game_end',
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

export enum PlayerInfo {
  TOPIC = 'requestPlayerInfo',
  REPLY = 'sendPlayerInfo',
}

export enum GameStatus {
  BADGAME = 'invalid_game',
  NOCONNECT = 'missing_player',
  INTERRUPTED = 'interrupted',
  COMPLETED = 'completed',
}
