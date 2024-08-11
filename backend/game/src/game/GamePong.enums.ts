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
	ARROWLEFT = 37,
	ARROWUP = 38,
	ARROWRIGHT = 39,
	ARROWDOWN = 40,
	a = 65,
	d = 68,
	s = 83,
	w = 87,
}
