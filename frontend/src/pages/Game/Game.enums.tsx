
export enum GameTypes
{
	PONG =	"PONG",
};

export enum MatchTypes
{
	SOLO =	"solo",
	LOCAL =	"local",
	PAIR =	"pair",
	MATCH =	"match",
};

export enum GameState
{
	ERROR = -1,
	CONNECT,
	MENU,
	MATCH,
	LOADING,
	PLAYING,
	GAMEOVER,
}

export enum Button
{
	ENTER = 13,
	ESCAPE = 27,
	SPACE = 32,
	ARROWLEFT = 37,
	ARROWUP = 38,
	ARROWRIGHT = 39,
	ARROWDOWN = 40,
	s = 83,
	w = 87,
}
