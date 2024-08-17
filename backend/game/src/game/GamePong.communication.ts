/* ************************************************************************** *\

	Games

\* ************************************************************************** */

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

/* ************************************************************************** *\

	Socket.io

\* ************************************************************************** */

export namespace SocketCommunication
{

/* ************************************************************************** *\
	Socket.io - Frontend/GameManager
\* ************************************************************************** */

	export namespace ServerReady
	{
		export const TOPIC: string =	"ServerReady";
	}

	export namespace UserPack
	{
		export const TOPIC: string =	"UserPack";

		export interface IUserPack
		{
			playerID: string,
			playerName: string,
		};
	}

	export namespace RequestMenu
	{
		export const TOPIC: string =	"RequestMenu";
		export const REPLY: string =	"GameMenu";
	}

	export namespace LeaveMatchMaker
	{
		export const TOPIC: string =	"LeaveMatchMaker";

		export interface ILeaveMatchMaker
		{
			playerID: string,
		};
	}

/* ************************************************************************** *\
	Socket.io - Frontend/GamePlayer
\* ************************************************************************** */

	export namespace PlayGame
	{
		export const TOPIC: string =	"PlayGame";
	}

	export namespace Button
	{
		export const TOPIC: string =	"Button";

		export interface IButton
		{
			code: any,
			event: any,
		};
	}

/* ************************************************************************** *\
	Socket.io - Frontend/MatchMaker
\* ************************************************************************** */

	export namespace MatchMaker
	{
		export const TOPIC: string = "Matchmaker";

		export interface IMatchMaker
		{
			queue: string,
			rank: number,
			time: number,
		};
	}

/* ************************************************************************** *\
	Socket.io - Frontend/GamePong
\* ************************************************************************** */

	export namespace GameImage
	{
		export const REQUEST: string =	"GameImage";
		export const TOPIC: string =	"GameImage";
		export const TOPICHUD: string =	"GameHUD";
		export const REQUESTFULL: string =	"GameImageFull";

		export interface IPong
		{
			Game:		string,
			Theme:		string,
			Player1:	IPlayer,
			Player2:	IPlayer,
			Ball:		IBall | null,
		};

		export interface IPlayer
		{
			posX:	number,
			posY:	number,
			height:	number,
			width:	number,
			msg:	string | null,
		};

		export interface IBall
		{
			posX:	number,
			posY:	number,
			posZ:	number,
			size:	number,
		};

		export interface IPongHUD
		{
			game:	string,
			Player1:	IPongHUDPlayer,
			Player2:	IPongHUDPlayer,
		};

		export interface IPongHUDPlayer
		{
			name:	string,
			score:	number,
			status:	string,
		};
	}
}





// // export enum SockEventNames
// // {
// // 	SERVERREADY =	"ServerReady",
// // 	MSG =	"Message",
// // 	CONNECTGAME =	"ConnectGame",
// // 	RMMATCH =	"RemoveFromMatchmaking",
// // 	REQPONGIMG = "RequestPongImage",
// // 	PONGIMG =	"PongImage",
// // 	PONGHUD =	"PongHUD",
// // 	BUTTON =	"Button",
// // 	ENDGAME =	"EndGame",
// // };

// // export interface ISockConnectGame
// // {
// // 	gameType:	GameTypes,
// // 	matchType:	MatchTypes,
// // 	playerID:	string,
// // };

// // export interface ISockButton
// // {
// // 	code:	any,
// // 	name:	any,
// // 	press:	any,
// // 	event:	any,
// // };

// export interface ISockPongImage
// {
// 	Game:		string,
// 	Theme:		string,
// 	Player1:	ISockPongImagePlayer,
// 	Player2:	ISockPongImagePlayer,
// 	Ball:		ISockPongImageBall | null,
// };
// export interface ISockPongImagePlayer
// {
// 	posX:	number,
// 	posY:	number,
// 	height:	number,
// 	width:	number,
// 	msg:	string | null,
// };
// export interface ISockPongImageBall
// {
// 	posX:	number,
// 	posY:	number,
// 	posZ:	number,
// 	size:	number,
// }

// // export interface ISockPongHud
// // {
// // 	Player1:	ISockPongHudPlayer,
// // 	Player2:	ISockPongHudPlayer,
// // };
// export interface ISockPongHudPlayer
// {
// 	name:	string,
// 	score:	number,
// 	status:	string,
// };

// export interface ISockRemoveMatch
// {
// 	queue:	string,
// 	rank:	number,
// 	time:	number,
// }

/* ************************************************************************** *\

	Kafka

\* ************************************************************************** */

import { logLevel } from 'kafkajs';
import { Button } from './GamePong.enums';
import { MatchMaker } from './NewGameMatchMaker';

export namespace KafkaCommunication
{
	export namespace Settings
	{
		export const CLIENTID: any =	"GameManager";
		export const BROKERS: any =	'kafka:29092';
		export const LOGLEVEL: any =	logLevel.ERROR;
		export const GROUPID: any =	'game-consumer';
	}

/* ************************************************************************** *\
	Kafka - Chat/GameManager
\* ************************************************************************** */

	export namespace NewGame
	{
		export const TOPIC: string = "NewGame";

		export interface INewGame
		{
			gameType:	GameTypes,//GameTypes.PONG
			matchType:	MatchTypes,//MatchTypes.PAIR
			player1ID:	string,
			player2ID:	string,
		}
	}

/* ************************************************************************** *\
	Kafka - Database/GameManager/GamePlayer
\* ************************************************************************** */

	export namespace PlayerInfo
	{
		export const TOPIC: string = "requestPlayerInfo";
		export const REPLY: string = "sendPlayerInfo";

		export interface IPlayerInfo
		{
			playerID:	string,
			playerName?:	string,
			playerRank?:	number,
		};
	}
}

/* ************************************************************************** *\

	Socket.io & Kafka

\* ************************************************************************** */

export namespace SharedCommunication
{
	export namespace PongStatus
	{
		export const TOPIC: string =	"game_end";

		export enum Status
		{
			BADGAME =	"invalid_game",
			NOCONNECT = "missing_player",
			INTERRUPTED =	"interrupted",
			COMPLETED =	"completed",
		}

		export interface IPongStatus
		{
			gameType:	GameTypes,//GameTypes.PONG
			matchType:	MatchTypes,
			status:		Status,
			duration:		number,//miliseconds
			player1ID:		string,
			player1Score:	number,
			player2ID:		string | null,
			player2Score:	number,
		};
	}
}






// export enum KafkaSetting
// {
// 	CLIENTID =	"GameManager",
// 	BROKERS =	'kafka:29092',
// 	LOGLEVEL =	logLevel.ERROR,
// };

// /* ************************************************************************** *\

// 	Kafka - Game/Chat

// \* ************************************************************************** */

// export enum NewGame
// {
// 	TOPIC =	"NewGame",
// };

// export interface INewGame
// {
// 	gameType:	GameTypes,//GameTypes.PONG
// 	matchType:	MatchTypes,//MatchTypes.PAIR
// 	player1ID:	string,
// 	player2ID:	string,
// };

// /* ************************************************************************** *\

// 	Kafka - Game/Database

// \* ************************************************************************** */

// export enum PlayerInfo
// {
// 	TOPIC =	"requestPlayerInfo",
// 	REPLY =	"sendPlayerInfo",
// 	// REPLYNAME = "sendPlayerInfoName",
// 	// REPLYRANK = "sendPlayerInfoRank",
// };

// export interface IPlayerInfo
// {
// 	playerID:	string,
// 	playerName?:	string,
// 	playerRank?:	number,
// };

// export enum GameStatus
// {
// 	TOPIC =	"game_end",
// 	BADGAME =	"invalid_game",
// 	NOCONNECT = "missing_player",
// 	INTERRUPTED =	"interrupted",
// 	COMPLETED =	"completed",
// };

// export interface IGameStatus
// {
// 	gameType:	GameTypes,//GameTypes.PONG
// 	matchType:	MatchTypes,
// 	status:		GameStatus,
// 	duration:		number,//miliseconds
// 	player1ID:		string,
// 	player1Score:	number,
// 	player2ID:		string | null,
// 	player2Score:	number,
// };
