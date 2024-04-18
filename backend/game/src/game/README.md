```kafka
key:	"pongNewGame"
messages:
{
	gameType:	"pongPair", pongSolo/pongPair/pongMatch
	player1ID:	"",
	player1Name:	"",
	player2ID:	"", //0 = bot
	player2Name:	"",
}
// if ID = 0, is bot

key:	""
messages:
{
	ID:	"",
	newName:	"",
}

key:	"game_end"
messages:
{
	gameType:	"",
	player1ID:	"",
	player1Score:	"",
	player2ID:	"",
	player2Score:	"",
	status:	"",
}

```

solo play vs bot
matchmaking system
paired game

Darina:
export class GameEndDto {
  player1_id: string;
  player2_id: string;
  player1_score: number;
  player2_score: number;
  duration: number; // duration of the game in ms
  status: GameStatus;
}

export enum GameStatus {
  COMPLETED = 'completed',
  INTERRUPTED = 'interrupted',
}