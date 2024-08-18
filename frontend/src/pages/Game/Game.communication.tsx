import { GameTypes, MatchTypes } from "./Game.enums"

export namespace SocketCommunication
{
	export namespace UserPack
	{
		export const REQUEST: string = "ServerReady";
		export const TOPIC: string = "UserPack";

		export interface IUserPack
		{
			playerID: string,
			playerName: string,
		};
	}

	export const PLAYERREADY: string = "PlayerReady";

	export const GAMEMENU: string =	"GameMenu";

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
