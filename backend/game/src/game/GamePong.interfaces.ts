export interface Player
{
	client:	any | null;
	id:		any;
	name:	string;
	paddle: Paddle;
	status:	string;
	score:	number;
	button:	{[key: number]: boolean};
}

export interface Paddle
{
	posX:	number;
	posY:	number;
	width:	number;
	height:	number;
	speed:	number;
}

export interface Ball
{
	posX:	number;
	posY:	number;
	rad:	number;
	speed:	number;
	maxSpeed:	number;
	angle:	number;
}

export interface PlayerRanked
{
	player: any,
	// client:	any,
	id:		string,
	rank:	number,
	time:	number,
}
