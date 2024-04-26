// export enum GameStatus
// {
// 	COMPLETED = 'completed',
// 	INTERRUPTED = 'interrupted'
// }

export enum GameState
{
	WAITING,
	START,
	NEWBALL,
	PLAYING,
	PAUSED,
	UNPAUSE,
	GAMEOVER,
}

export enum	PlayerStatus
{
	DISCONNECTED = "Disconnected",
	CONNECTING = "Connecting",
	WAITING = "Waiting",
	NOTREADY = "Press Space to Start",
	READY = "Ready",
	PLAYING = " ",
}

export enum Button
{
	SPACE = 32,
	ARROWUP = 38,
	ARROWDOWN = 40,
	s = 83,
	w = 87,
}
