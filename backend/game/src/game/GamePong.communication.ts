/* ************************************************************************** *\

	Games

\* ************************************************************************** */

export enum GameTypes
{
	PONG =	"pong",
};

export enum MatchTypes
{
	SOLO =	"solo",
	LOCAL =	"local",
	PAIR =	"pair",
	MATCH =	"match",
};

/* ************************************************************************** *\

	Socket.io - Frontend/Game

\* ************************************************************************** */

export enum SockEventNames
{
	SERVERREADY =	"ServerReady",
	MSG =	"Message",
	CONNECTGAME =	"ConnectGame",
	RMMATCH =	"RemoveFromMatchmaking",
	REQPONGIMG = "RequestPongImage",
	PONGIMG =	"PongImage",
	PONGHUD =	"PongHUD",
	BUTTON =	"Button",
	ENDGAME =	"EndGame",
};

export interface ISockConnectGame
{
	gameType:	GameTypes,
	matchType:	MatchTypes,
	playerID:	string,
};

export interface ISockButton
{
	code:	any,
	name:	any,
	press:	any,
	event:	any,
};

export interface ISockPongImage
{
	Game:		string,
	Theme:		string,
	Player1:	ISockPongImagePlayer,
	Player2:	ISockPongImagePlayer,
	Ball:		ISockPongImageBall | null,
};
export interface ISockPongImagePlayer
{
	posX:	number,
	posY:	number,
	height:	number,
	width:	number,
	msg:	string | null,
};
export interface ISockPongImageBall
{
	posX:	number,
	posY:	number,
	size:	number,
}

export interface ISockPongHud
{
	Player1:	ISockPongHudPlayer,
	Player2:	ISockPongHudPlayer,
};
export interface ISockPongHudPlayer
{
	name:	string,
	score:	number,
	status:	string,
};

export interface ISockRemoveMatch
{
	rank:	number,
	time:	number,
}

/* ************************************************************************** *\

	Kafka - Game/Chat

\* ************************************************************************** */

import { logLevel } from 'kafkajs';

export enum KafkaSetting
{
	CLIENTID =	"GameManager",
	BROKERS =	'kafka:29092',
	LOGLEVEL =	logLevel.ERROR,
};

/* ************************************************************************** *\

	Kafka - Game/Chat

\* ************************************************************************** */

export enum NewGame
{
	TOPIC =	"NewGame",
};

export interface INewGame
{
	gameType:	GameTypes,//GameTypes.PONG
	matchType:	MatchTypes,//MatchTypes.PAIR
	player1ID:	string,
	player2ID:	string,
};

/* ************************************************************************** *\

	Kafka - Game/Database

\* ************************************************************************** */

export enum PlayerInfo
{
	TOPIC =	"requestPlayerInfo",
	REPLY =	"sendPlayerInfo",
};

export interface IPlayerInfo
{
	playerID:	string,
	playerName?:	string,
	playerRank?:	number,
};

export enum GameStatus
{
	TOPIC =	"game_end",
	BADGAME =	"invalid_game",
	NOCONNECT = "missing_player",
	INTERRUPTED =	"interrupted",
	COMPLETED =	"completed",
};

export interface IGameStatus
{
	gameType:	GameTypes,//GameTypes.PONG
	matchType:	MatchTypes,
	status:		GameStatus,
	player1ID:		string,
	player1Score:	number,
	player2ID:		string | null,
	player2Score:	number,
};
