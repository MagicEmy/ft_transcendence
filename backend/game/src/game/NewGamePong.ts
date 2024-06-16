import { GamePlayer } from "./GamePlayer";
import { IGame } from "./IGame";
import { PlayerInfo, IPlayerInfo, SockEventNames, ISockPongImage, ISockPongImagePlayer, ISockPongImageBall, ISockPongHudPlayer, GameTypes, IGameStatus, MatchTypes, GameStatus } from './GamePong.communication';
import { PlayerStatus } from "./GamePong.enums";

interface Player
{
	player:	GamePlayer | null;
	id:		any;
	paddle:	Paddle;
	status:	string;
	score:	number
}

interface Paddle
{
	posX:	number;
	posY:	number;
	width:	number;
	height:	number;
	speed:	number;
}

interface Ball
{
	posX:	number;
	posY:	number;
	rad:	number;
	speed:	number;
	maxSpeed:	number;
	angle:	number;
}

export class GamePong implements IGame
{
	private static gameFlag: string = "PONG";
	private mode: string;
	private player1: Player;
	private player2: Player;
	private ball: Ball | null;

	constructor(data: string[], players: string[])
	{
		console.log(`Creating new pong game ${data}/${players}`);
		this.mode = data[0];
		let player1: string;
		let player2: string | null = null;

		player1 = players[0];
		switch (this.mode)
		{
			case "solo":
				if (players.length != 1)
					throw ("Wrong amount of players");
				break ;
			case "local":
				if (players.length != 1)
					throw ("Wrong amount of players");
				break ;
			case "match":
				if (players.length != 2)
					throw ("Wrong amount of players");
				player2 = players[1];
				break;
			default:
				throw (`Unknown game mode ${this.mode}`);
		}
		this.player1 = this.ConstructPlayer(player1, 1/23);
		this.player2 = this.ConstructPlayer(player2, 22/23);
		this.ball = null;
	}

	private ConstructPlayer(id: any, posX: number): Player
	{
		const player: Player =
		{
			player:	null,
			id:		(id !== undefined) ? id : null,
			paddle:	{posX: posX, posY: 0.5, width: 0.01, height: 0.1, speed: 0.005},
			status:	(id !== undefined) ? PlayerStatus.CONNECTING : PlayerStatus.WAITING,
			score:	0,
		}
		return (player);
	}
	
	public AddPlayer(playerToAdd: GamePlayer): boolean
	{
		console.log("Adding player to pong");
		let playerPos: Player;
		if (playerToAdd.getId() === this.player1.id)
			playerPos = this.player1;
		else if (playerToAdd.getId() === this.player2.id)
			playerPos = this.player2;
		if (playerPos === undefined)
			return (false);
		playerPos.player = playerToAdd;
		this.AddListerners(playerPos, playerToAdd.getClient());
		this.sendHUD();
		return (true);
	}

	public PlayerIsInGame(player: GamePlayer): boolean
	{
		return (true);
	}

	public clearGame(): void
	{
		
	}

/* ************************************************************************** *\

	Socket Listeners

\* ************************************************************************** */

	private AddListerners(player: Player, client: any): void
	{
		client.on("disconnect", () => { this.handlerDisconnect(client); });
		client.on("GameImage", () => { this.handlerImage(client) });
	}

	private handlerDisconnect(client: any)
	{
		console.log("GamePong: disconnect", client.id);
	}

	private handlerImage(client: any): void
	{
		this.sendImage(client);
	}

/* ************************************************************************** *\

	Socket Emitters

\* ************************************************************************** */

	private sendImage(client: any): void
	{
		let imageData: ISockPongImage;

		const P1: ISockPongImagePlayer = this.GetImageDataPlayer(this.player1);
		const P2: ISockPongImagePlayer = this.GetImageDataPlayer(this.player2);
		const ball: ISockPongImageBall | null = this.GetImageDataBall();
		console.warn("need to adjust note pong");
		if (this.player1.player.getClient() === client)
			imageData = { Player1: P1, Player2: P2, Ball: ball};
		else
		{
			imageData = { Player1: P2, Player2: P1, Ball: ball};
			this.MirrorImageDataXAxis(imageData);
		}
		if (client.emit)
			client.emit("GameImage", JSON.stringify(imageData));
	}

	private GetImageDataPlayer(player: Player): ISockPongImagePlayer
	{
		return (
		{
			posX:	player.paddle.posX,
			posY:	player.paddle.posY,
			height:	player.paddle.height,
			width:	player.paddle.width,
			msg:	player.status,
		});
	}

	private GetImageDataBall(): ISockPongImageBall | null
	{
		let ball: ISockPongImageBall | null = null;
		if (this.ball !== null)
		{
			ball = {
				posX: this.ball.posX,
				posY: this.ball.posY,
				size: this.ball.rad * 2,
			}
		}
		return (null);
	}

	private MirrorImageDataXAxis(imageData: ISockPongImage): void
	{
		imageData.Player1.posX = 1 - imageData.Player1.posX;
		imageData.Player2.posX = 1 - imageData.Player2.posX;
		if (imageData.Ball !== null)
			imageData.Ball.posX = 1 - imageData.Ball.posX;
	}

	private sendHUD(): void
	{
		const P1: ISockPongHudPlayer = this.GetHUDDataPlayer(this.player1);
		const P2: ISockPongHudPlayer = this.GetHUDDataPlayer(this.player2);
		if (this.player1.player?.getClient() && 
			this.player1.player.getClient().emit)
		{
			console.warn("sending hud!");
			const HUD = {game: "pong", P1: P1, P2: P2};
			this.player1.player.getClient().emit("GameHUD", JSON.stringify(HUD));
		}
		if (this.player2.player?.getClient() && 
			this.player2.player.getClient().emit)
		{
			const HUD = {game: "pong", P1: P2, P2: P1};
			this.player2.player.getClient().emit("GameHUD", JSON.stringify(HUD));
		}
	}

	private GetHUDDataPlayer(player: Player): ISockPongHudPlayer
	{
		let name: string = (player.player !== null) ? player.player.name : "Bot";
		
		return (
		{
			name:	name,
			score:	player.score,
			status:	player.status,
		});
	}


/* ************************************************************************** *\

	Menu

\* ************************************************************************** */

	public static GetFlag(): string
	{
		return (GamePong.gameFlag);
	}

	public static GetMenuRowJson(): any
	{
		return {
			name: "Pong",
			flag: GamePong.gameFlag,
			options:
			[
				[
					{ name: "Solo", flag: "solo" },
					{ name: "Local", flag: "local" }
				],
				[
					{ name: "Retro", flag: "retro" },
					{ name: "Modern", flag: "modern" }
				]
			]
		};
	}
}
