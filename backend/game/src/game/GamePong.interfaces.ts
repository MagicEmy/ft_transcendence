import { GamePlayer } from "./GamePlayer";

export interface IPlayer
{
	player:	GamePlayer | null;
	id:		any;
	paddle:	IPaddle;
	status:	string;
	score:	number
};

export interface IPaddle
{
	posX:	number;
	posY:	number;
	width:	number;
	height:	number;
	speed:	number;
}

export interface IBall
{
	posX:	number;
	posY:	number;
	posZ:	number;
	rad:	number;
	speed:	number;
	maxSpeed:	number;
	angle:	number;
	lastHit:	IPaddle | null;
	lastPaddle:	IPaddle | null;
}

export interface IPlayerRanked
{
	player: any,
	// client:	any,
	id:		string,
	rank:	number,
	time:	number,
}
