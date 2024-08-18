import { Socket } from 'socket.io';

import { IGame } from "./IGame";
import { GamePlayer } from "./GamePlayer";
import { GameManager } from "./GameManager";
import { GameTypes, MatchTypes, SocketCommunication, SharedCommunication } from './GamePong.communication';
import { Button, GameState, PlayerStatus } from "./GamePong.enums";
import { IPlayer, IPaddle, IBall } from "./GamePong.interfaces";

const maxScore: number = 3;
const connectionTime: number = 60000; // 1 minute
const disconnectTime: number = 300000; // 5 minutes

const FLAGS =
{
	NAME:	"Pong",
	FLAG:	"PONG",
	SOLO:
	{
		NAME: "Solo",
		FLAG: "solo"
	},
	LOCAL:
	{
		NAME: "Local",
		FLAG: "local"
	},
	MATCH:
	{
		NAME: "Match",
		FLAG: "pair"
	}
} as const;

export class GamePong implements IGame
{
	private static gameFlag: string = FLAGS.FLAG;
	private gameState: GameState;
	private oldState: GameState;
	private mode: MatchTypes;
	private theme: string;
	private player1: IPlayer;
	private player2: IPlayer;
	private ball: IBall | null;

	private interval: any;
	private ImageHandlers: Map<Socket, (client: Socket) => void>;
	private DisconnectHandlers: Map<Socket, (client: Socket) => void>;
	private ImageFullHandelers: Map<Socket, (client: Socket) => void>;

	// private id: string = Math.random().toString(36).substr(2, 9);

	private timerGame: number;
	private timerEvent: number;

	constructor(data: string[], players: string[])
	{
		console.log(`Pong: Creating new game ${data}/${players}`);
		this.SetMode(data[0]);
		// this.mode = data[0];
		this.theme = data[1];
		if (this.theme === undefined)
			this.theme = "retro";
		let player1: string;
		let player2: string | null = null;

		player1 = players[0];
		switch (this.mode)
		{
			case FLAGS.SOLO.FLAG:
				if (players.length != 1)
					throw ("Wrong amount of players");
				break ;
			case FLAGS.LOCAL.FLAG:
				if (players.length != 1)
					throw ("Wrong amount of players");
				break ;
			case FLAGS.MATCH.FLAG:
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
		this.SetGameState(GameState.WAITING);
		this.ImageHandlers = new Map<Socket, (client: Socket) => void>();
		this.ImageFullHandelers = new Map<Socket, (client: Socket) => void>();
		this.DisconnectHandlers = new Map<Socket, (client: Socket) => void>();
		this.interval = setInterval(this.GameLoop.bind(this), 16);
	}

	private SetMode(mode: string): void
	{
		switch (mode)
		{
			case MatchTypes.SOLO:
				this.mode = MatchTypes.SOLO;	return;
			case MatchTypes.LOCAL:
				this.mode = MatchTypes.LOCAL;	return;
			case MatchTypes.PAIR:
				this.mode = MatchTypes.PAIR;	return;
			case MatchTypes.MATCH:
				this.mode = MatchTypes.MATCH;	return;
			default:
				this.mode = undefined;	return;
		}
	}

	private ConstructPlayer(playerId: any, posX: number): IPlayer
	{
		const player: IPlayer =
		{
			player:	(playerId !== null) ? null : new GamePlayer(null, null),
			id:		(playerId !== null) ? playerId : null,
			paddle:	{posX: posX, posY: 0.5, width: 0.01, height: 0.1, speed: 0.005},
			status:	(playerId !== null) ? PlayerStatus.CONNECTING : PlayerStatus.WAITING,
			score:	0,
		}
		return (player);
	}

	public AddPlayer(playerToAdd: GamePlayer): boolean
	{
		let playerPos: IPlayer;
		if (playerToAdd?.getId() === this.player1.id)
			playerPos = this.player1;
		else if (playerToAdd?.getId() === this.player2.id)
			playerPos = this.player2;
		console.log(`Pong: Adding player ${playerPos?.player?.name}[${playerPos?.id}]`);
		if (playerPos === undefined)
			return (false);
		playerPos.player = playerToAdd;
		this.AddListerners(playerPos, playerToAdd.getClient());
		playerPos.status = PlayerStatus.WAITING;
		this.SendGameInfo(playerPos);
		// this.SendHUD();
//TODOKAFKA: add kafka to inform player is playing
		return (true);
	}

	public PlayerIsInGame(player: GamePlayer): boolean
	{
		return (this.player1.id == player.getId() ||
				this.player2.id == player.getId());
	}

	public ClearGame(): void
	{
		if (this.player1.player.getClient())
			this.RemoveListeners(this.player1.player.getClient());
		if (this.player2.player.getClient())
			this.RemoveListeners(this.player2.player.getClient());
	}

/* ************************************************************************** *\

	Socket Listeners

\* ************************************************************************** */

	private AddListerners(player: IPlayer, client: Socket): void
	{
		var handler: any;

		handler = () => this.HandlerImage(client);
		this.ImageHandlers.set(client, handler);
		client.on(SocketCommunication.GameImage.REQUEST, handler);

		handler = () => this.HandlerImageFull(client);
		this.ImageFullHandelers.set(client, handler);
		client.on(SocketCommunication.GameImage.REQUESTFULL, handler);

		handler = () => this.HandlerDisconnect(client);
		this.DisconnectHandlers.set(client, handler);
		client.on("disconnect", handler);
	}

	private RemoveListeners(client: Socket): void
	{
		var handler: any;

		handler = this.ImageHandlers.get(client);
		if (handler)
		{
			client.off(SocketCommunication.GameImage.REQUEST, handler);
			this.ImageHandlers.delete(client);
		}

		handler = this.ImageFullHandelers.get(client);
		if (handler)
		{
			client.off(SocketCommunication.GameImage.REQUESTFULL, handler);
			this.ImageFullHandelers.delete(client);
		}

		handler = this.DisconnectHandlers.get(client);
		if (handler)
		{
			client.off("disconnect", handler);
			this.DisconnectHandlers.delete(client);
		}
	}

	private RemoveAllListeners(): void
	{
		this.ImageHandlers.forEach((handler, client) =>
		{
			client.removeAllListeners(SocketCommunication.GameImage.REQUEST);
			this.ImageHandlers.delete(client);
		});

		this.ImageFullHandelers.forEach((handler, client) =>
		{
			client.removeAllListeners(SocketCommunication.GameImage.REQUESTFULL);
			this.ImageHandlers.delete(client);
		});
		
		this.DisconnectHandlers.forEach((handler, client) =>
		{
			client.off("disconnect", handler)
			this.DisconnectHandlers.delete(client);
		});
	}

	private HandlerDisconnect(client: Socket): void
	{
		console.log(`Pong: Disconnect: ${client.id}`);

		this.player1.status = this.player1.player.getClient() === client ? PlayerStatus.DISCONNECTED : PlayerStatus.WAITING;
		this.player2.status = this.player2.player?.getClient() === client ? PlayerStatus.DISCONNECTED : PlayerStatus.WAITING;

		this.SetGameState(GameState.PAUSED);

		this.RemoveListeners(client);
	}

	private HandlerImage(client: Socket): void
	{
		this.SendImage(client);
	}

	private HandlerImageFull(client: Socket): void
	{
		this.SendImage(client);
		this.SendHUD();
	}

/* ************************************************************************** *\

	Socket Emitters

\* ************************************************************************** */

	private SendGameInfo(player: IPlayer)
	{
		const data: SocketCommunication.NewGame.INewGame =
		{
			game: GameTypes.PONG,
			theme:	this.theme,
			mode:	this.mode,
		};

		player.player.getClient()?.emit(SocketCommunication.NewGame.TOPIC, JSON.stringify(data));
		this.SendHUD();
	}

	private SendImage(client: any): void
	{
		let imageData: SocketCommunication.GameImage.IPong;

		const P1: SocketCommunication.GameImage.IPlayer = this.GetImageDataPlayer(this.player1);
		const P2: SocketCommunication.GameImage.IPlayer = this.GetImageDataPlayer(this.player2);
		const ball: SocketCommunication.GameImage.IBall | null = this.GetImageDataBall();

		if (this.player1.player.getClient() === client)
			imageData = { Game: GamePong.gameFlag, Theme: this.theme,
							Player1: P1, Player2: P2, Ball: ball};
		else
		{
			imageData = { Game: GamePong.gameFlag, Theme: this.theme,
							Player1: P2, Player2: P1, Ball: ball};
			this.MirrorImageDataXAxis(imageData);
		}
		if (client.emit)
			client.emit(SocketCommunication.GameImage.TOPIC, JSON.stringify(imageData));
	}

	private GetImageDataPlayer(player: IPlayer): SocketCommunication.GameImage.IPlayer
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

	private GetImageDataBall(): SocketCommunication.GameImage.IBall | null
	{
		let ball: SocketCommunication.GameImage.IBall | null = null;
		if (this.ball !== null)
			return({
				posX: this.ball.posX,
				posY: this.ball.posY,
				posZ: this.ball.posZ,
				size: this.ball.rad * 2,
			});
		return (null);
	}

	private MirrorImageDataXAxis(imageData: SocketCommunication.GameImage.IPong): void
	{
		imageData.Player1.posX = 1 - imageData.Player1.posX;
		imageData.Player2.posX = 1 - imageData.Player2.posX;
		if (imageData.Ball !== null)
			imageData.Ball.posX = 1 - imageData.Ball.posX;
	}

	private SendHUD(): void
	{
		const P1: SocketCommunication.GameImage.IPongHUDPlayer = this.GetHUDDataPlayer(this.player1);
		const P2: SocketCommunication.GameImage.IPongHUDPlayer = this.GetHUDDataPlayer(this.player2);

		this.SendToPlayer(this.player1, SocketCommunication.GameImage.TOPICHUD, JSON.stringify({game: GameTypes.PONG, P1: P1, P2: P2}));
		this.SendToPlayer(this.player2, SocketCommunication.GameImage.TOPICHUD, JSON.stringify({game: GameTypes.PONG, P1: P2, P2: P1}));
	}



	private GetHUDDataPlayer(player: IPlayer): SocketCommunication.GameImage.IPongHUDPlayer
	{
		let name: string = (player.player !== null) ? player.player.name : "";
	
		return (
		{
			name:	name,
			score:	player.score,
			status:	player.status,
		});
	}

	private SendToPlayer(player: IPlayer, flag: string, msg: string)
	{
		const client: any = player.player?.getClient();

		if (client != null && client.emit)
			client.emit(flag, msg);
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
			name: FLAGS.NAME,
			flag: GamePong.gameFlag,
			options:
			[
				[
					{ name: FLAGS.SOLO.NAME, flag: FLAGS.SOLO.FLAG },
					{ name: FLAGS.LOCAL.NAME, flag: FLAGS.LOCAL.FLAG }
				],
				[
					{ name: "Retro", flag: "retro" },
					{ name: "Modern", flag: "modern" }
				]
			]
		};
	}

/* ************************************************************************** *\

	GameLoop

\* ************************************************************************** */

	private GameLoop(): void
	{
		switch (this.gameState)
		{
			case GameState.WAITING:
				this.GameLoopWaiting();	break ;
			case GameState.START:
				this.GameLoopStart();	break ;
			case GameState.NEWBALL:
				this.GameLoopNewBall();	break ;
			case GameState.PLAYING:
				this.GameLoopPlaying();	break ;
			case GameState.PAUSED:
				this.GameLoopPaused();	break ;
			case GameState.UNPAUSE:
				this.GameLoopUnpause();	break ;
			case GameState.GAMEOVER:
				this.GameLoopGameOver();	break ;
			default:
				console.error(`Error: unknown GameState ${this.gameState}`);
		}
	}

	private SetGameState(newState: GameState): void
	{
		switch (newState)
		{
			case GameState.WAITING:
				this.timerGame = Date.now();
				this.timerEvent = Date.now();
				break ;
			case GameState.START:
				this.player1.status = PlayerStatus.NOTREADY;
				this.player2.status = PlayerStatus.NOTREADY;
				this.timerGame = Date.now();
				break ;
			case GameState.NEWBALL:
				this.player1.status = PlayerStatus.PLAYING;
				this.player2.status = PlayerStatus.PLAYING;
				break ;
			case GameState.PLAYING:
				break ;
			case GameState.PAUSED:
				if (this.gameState !== GameState.PAUSED)
					this.oldState = this.gameState;
				this.timerEvent = Date.now();
				break ;
			case GameState.UNPAUSE:
				this.player1.status = PlayerStatus.NOTREADY;
				this.player2.status = PlayerStatus.NOTREADY;
				this.timerEvent = Date.now();
				break ;
			case GameState.GAMEOVER:
				break ;
			default:
				console.error(`Error: unknown GameState ${this.gameState}`); return ;
		}
		this.gameState = newState;
		this.SendHUD();

	}

/* ************************************************************************** *\
	GameLoop - Waiting
\* ************************************************************************** */

	private GameLoopWaiting(): void
	{
		if (this.player1.status === PlayerStatus.WAITING &&
			this.player2.status === PlayerStatus.WAITING)
		{
			this.SetGameState(GameState.START);
		}
		else if (this.timerEvent + connectionTime < Date.now())
			this.EndGame(SharedCommunication.PongStatus.Status.NOCONNECT);
	}

/* ************************************************************************** *\
	GameLoop - Start
\* ************************************************************************** */

	private GameLoopStart(): void
	{
		this.PressSpaceToStart(this.player1);
		this.PressSpaceToStart(this.player2);
		this.UpdatePaddles();
		this.StartGame();
	}

	private StartGame(): void
	{
		if (this.player1.status === PlayerStatus.READY &&
			this.player2.status === PlayerStatus.READY)
		{
			this.SetGameState(GameState.NEWBALL);
		}
	}

/* ************************************************************************** *\
	GameLoop - NewBall
\* ************************************************************************** */

	private GameLoopNewBall(): void
	{
		this.UpdatePaddles();
		this.AddBall();
	}

/* ************************************************************************** *\
	GameLoop - Playing
\* ************************************************************************** */

	private GameLoopPlaying(): void
	{
		this.UpdatePaddles();
		this.UpdateBall();
		this.CheckEventScore();
	}

/* ************************************************************************** *\
	GameLoop - Paused
\* ************************************************************************** */

	private GameLoopPaused(): void
	{
		if (this.player1.status === PlayerStatus.WAITING &&
			this.player2.status === PlayerStatus.WAITING)
		{
			this.SetGameState(GameState.UNPAUSE);
		}
		else if (this.timerEvent + 60000 < Date.now()) // 60 seconds
			this.EndGame(SharedCommunication.PongStatus.Status.INTERRUPTED);
	}

/* ************************************************************************** *\
	GameLoop - Unpause
\* ************************************************************************** */

	private GameLoopUnpause(): void
	{
		this.PressSpaceToStart(this.player1);
		this.PressSpaceToStart(this.player2);

		if (this.player1.status === PlayerStatus.READY &&
			this.player2.status === PlayerStatus.READY)
		{
			this.SetGameState(this.oldState);
		}
		else if (this.timerEvent + disconnectTime < Date.now())
			this.EndGame(SharedCommunication.PongStatus.Status.INTERRUPTED);
	}

/* ************************************************************************** *\
	GameLoop - Game Over
\* ************************************************************************** */

	private GameLoopGameOver(): void
	{
		this.EndGame(SharedCommunication.PongStatus.Status.COMPLETED);
	}

/* ************************************************************************** *\

	Player

\* ************************************************************************** */

	private PressSpaceToStart(player: IPlayer)
	{
		if (player.status === PlayerStatus.NOTREADY &&
			(player.player.button[Button.SPACE] ||
			player.id === null))
		{
			player.status = PlayerStatus.READY;
			this.SendHUD();
		}
	}

	private UpdatePaddles(): void
	{
		let dirP1: number = 0;
		let dirP2: number = 0;

		switch (this.mode)
		{
			case FLAGS.SOLO.FLAG:
				this.BotKeyPress(this.player2);
				dirP1 = this.GetKeyPress(this.player1.player.button, true, true, this.theme === "modern");
				dirP2 = this.GetKeyPress(this.player2.player.button, false, true, false);
				break ;
			case FLAGS.LOCAL.FLAG:
				dirP1 = this.GetKeyPress(this.player1.player.button, true, false, this.theme === "modern");
				dirP2 = this.GetKeyPress(this.player1.player.button, false, true, this.theme === "modern");
				break ;
			default:
				dirP1 = this.GetKeyPress(this.player1.player.button, true, true, this.theme === "modern");
				dirP2 = this.GetKeyPress(this.player2.player.button, true, true, this.theme === "modern");
				break ;
		}

		this.UpdatePaddle(this.player1.paddle, dirP1);
		this.UpdatePaddle(this.player2.paddle, dirP2);
	}

	private GetKeyPress(key: { [key: number]: boolean }, wasd: boolean, arrows: boolean, horizontal: boolean): number
	{
		let dir: number = 0;

		if (wasd)
		{
			if (horizontal)
				dir += this.GetDir(key[Button.a], key[Button.d]);
			else
				dir += this.GetDir(key[Button.w], key[Button.s]);
		}
		if (arrows)
		{
			if (horizontal)
				dir += this.GetDir(key[Button.ARROWLEFT], key[Button.ARROWRIGHT])
			else
				dir += this.GetDir(key[Button.ARROWUP], key[Button.ARROWDOWN]);
		}

		return (dir);
	}

	private GetDir(up: boolean, down: boolean): number
	{
		let dir: number = 0;

		if (up)
			dir -= 1;
		if (down)
			dir += 1;
		return (dir);
	}

	private UpdatePaddle(paddle: IPaddle, dir: number): void
	{
		paddle.posY += dir * paddle.speed;
	
		if (paddle.posY - paddle.height / 2 < 0)
			paddle.posY = paddle.height / 2;
		else if (paddle.posY + paddle.height / 2 > 1)
			paddle.posY = 1 - paddle.height / 2;

	}

	private BotKeyPress(bot: IPlayer): void
	{
		if (this.mode !== FLAGS.SOLO.FLAG)
			return;

		let posY: number = 0.5;
		if (this.ball)
		{
			let paddleDistance: number = this.player2.paddle.posX - this.player1.paddle.posX;
			let ratio: number = Math.abs(this.ball.posX - bot.paddle.posX);
			if (this.ball?.lastPaddle === bot.paddle)
				ratio = ratio;
			else
				ratio = (paddleDistance - ratio) + paddleDistance;
			ratio = ratio / (paddleDistance * 2);
			posY = this.ball.posY * ratio + 0.5 * (1 - ratio);
		}
		bot.player.button[Button.ARROWUP] = posY < bot.paddle.posY;
		bot.player.button[Button.ARROWDOWN] = posY > bot.paddle.posY;
	}

/* ************************************************************************** *\

	Ball

\* ************************************************************************** */

	private AddBall(): void
	{
		if (this.ball !== null)
			return ;

		this.AddBallRandom();
		this.SetGameState(GameState.PLAYING);
	}

	private AddBallRandom(): void
	{
		this.ball = 
		{
			posX:	0.5,
			posY:	0.5,
			posZ:	1,
			rad:	0.0025,
			speed:	0.002,
			maxSpeed:	0.010,
			angle:	0.5,
			lastHit:	null,
			lastPaddle:	null,
		};

		this.ball.angle = Math.random() + 0.25;
		if (this.ball.angle >= 0.75)
			this.ball.angle += 0.5;
		this.ball.angle *= Math.PI;
	}

	private UpdateBall(): void
	{
		let move: number = this.ball.speed;
		const stepSize: number = this.player1.paddle.width / 10;
		while (move > 0)
		{
			if (move < stepSize)
				move -= this.UpdateBallPosition(move);
			else
				move -= this.UpdateBallPosition(stepSize);
			this.CheckEventBorder();
			if (this.ball.posX < 0.5 && 
				this.ball.lastHit !== this.player1.paddle)
				this.CheckEventPaddle(this.player1.paddle);
			if (this.ball.posX > 0.5 &&
				this.ball.lastHit !== this.player2.paddle)
				this.CheckEventPaddle(this.player2.paddle);
		}
		this.UpdateBallHeightZ();
	}

	private UpdateBallPosition(remaining: number): number
	{
		let move: number = this.CalculateNearestEvent(remaining);
		if (move === remaining)
			move -= this.ball.rad;
		if (move <= 0)
			move = this.player1.paddle.width / 10;
		this.ball.posX += Math.sin(this.ball.angle) * move;
		this.ball.posY -= Math.cos(this.ball.angle) * move;
		return (move);
	}

	private CalculateNearestEvent(remaining: number): number
	{
		let move: number = remaining;

		//upper right border
		if (this.ball.angle > 0 && this.ball.angle < Math.PI * 0.5)
			move = (1 - this.ball.posY) / Math.sin(this.ball.angle);
		//upper left border
		else if (this.ball.angle > Math.PI * 1.5 && this.ball.angle < Math.PI * 2)
			move = (1 - this.ball.posY) / Math.sin(Math.PI * 2 - this.ball.angle);
		//lower right border
		else if (this.ball.angle > Math.PI * 0.5 && this.ball.angle < Math.PI)
			move = this.ball.posY / Math.sin(Math.PI - this.ball.angle);
		//lower left border
		else if (this.ball.angle > Math.PI && this.ball.angle < Math.PI * 1.5)
			move = this.ball.posY / Math.sin(this.ball.angle - Math.PI);
		if (move < remaining)
			remaining = move;

		let posX: number;
		let posY: number;
		//left paddle
		posX = this.GetRelevantPaddleBorder(this.ball.posX, this.player1.paddle.posX, this.player1.paddle.width / 2);
		posY = this.GetRelevantPaddleBorder(this.ball.posY, this.player1.paddle.posY, this.player1.paddle.width / 2);
		move = Math.sqrt(Math.pow(this.ball.posX - posX, 2) + Math.pow(this.ball.posY - posY, 2));
		if (move > 0 && move < remaining)
			remaining = move;
		//right paddle
		posX = this.GetRelevantPaddleBorder(this.ball.posX, this.player2.paddle.posX, this.player2.paddle.width / 2);
		posY = this.GetRelevantPaddleBorder(this.ball.posY, this.player2.paddle.posY, this.player2.paddle.width / 2);
		move = Math.sqrt(Math.pow(this.ball.posX - posX, 2) + Math.pow(this.ball.posY - posY, 2));
		if (move > 0 && move < remaining)
			remaining = move;

		return (remaining);
	}

	private AdjustBallAngle(direction: string)
	{
		switch(direction)
		{
			case "horizontal":
				if (this.ball.angle <= Math.PI)
					this.ball.angle = Math.PI - this.ball.angle;
				else
					this.ball.angle = Math.PI + (Math.PI * 2 - this.ball.angle);
					this.FixBallRadial();
				break ;
			case "vertical":
					this.ball.angle = Math.PI * 2 - this.ball.angle;
					this.FixBallRadial();
					this.KeepBallAngleReasonable();
				break ;
			default:
				console.error(`AdjustBallAngle() has no case for '${direction}`);
				break ;
		}

	}

	private FixBallRadial(): void
	{
		const circle: number = Math.PI * 2;

		if (this.ball.angle < 0)
			this.ball.angle += circle;
		if (this.ball.angle > circle)
			this.ball.angle -= circle;
	}

	private KeepBallAngleReasonable()
	{
		if (this.ball.angle < Math.PI * 0.125)
			this.ball.angle = Math.PI * 0.125;
		else if (this.ball.angle > Math.PI * 0.875 && this.ball.angle < Math.PI)
			this.ball.angle = Math.PI * 0.875;
		else if (this.ball.angle > Math.PI && this.ball.angle < Math.PI * 1.125)
			this.ball.angle = Math.PI * 1.125;
		else if (this.ball.angle > Math.PI * 1.875)
			this.ball.angle = Math.PI * 1.875;
	}

	private UpdateBallHeightZ()
	{
		const diff: number = Math.abs(this.player2.paddle.posX - this.player1.paddle.posX);
		let distance: number;
		if (this.ball.lastPaddle)
			distance = Math.abs(this.ball.lastPaddle.posX - this.ball.posX);
		else
			distance = Math.abs(0.5 - this.ball.posX) + diff / 2;
		distance /= diff;

		// height = -8/3x^2 + 2/3x + 1
		this.ball.posZ = Math.abs(-8/3 * Math.pow(distance, 2) + 2/3 * distance + 1);
	}

/* ************************************************************************** *\

	Events

\* ************************************************************************** */

	private CheckEventBorder(): void
	{
		if (this.ball.posY - this.ball.rad < 0 ||
			this.ball.posY + this.ball.rad > 1)
		{
			this.ball.speed = this.ball.speed * 0.975 + this.ball.maxSpeed * 0.025;
			this.AdjustBallAngle("horizontal");
			this.ball.lastHit = null;
		}
	}

	private CheckEventPaddle(paddle: IPaddle): void
	{
		let checkX: number = this.GetRelevantPaddleBorder(this.ball.posX, paddle.posX, paddle.width / 2);
		let checkY: number = this.GetRelevantPaddleBorder(this.ball.posY, paddle.posY, paddle.height / 2);
		let distance = Math.sqrt(Math.pow(this.ball.posX - checkX, 2) + Math.pow(this.ball.posY - checkY, 2));
		if (distance <= this.ball.rad)
		{
			if (checkX != this.ball.posX)
			{
					this.AdjustBallAngle("vertical");
					this.ball.angle += Math.atan((checkY - paddle.posY) /
												(checkX - paddle.posX)) / 3;
					this.ball.speed = this.ball.speed * 0.90 + this.ball.maxSpeed * 0.10;
			}
			else
				this.AdjustBallAngle("horizontal");
			this.ball.lastHit = paddle;
			this.ball.lastPaddle = paddle;
		}
	}

	private GetRelevantPaddleBorder(ballPos: number, paddlePos: number, paddleSize: number): number
	{
		let checkPos: number = ballPos;

		if (checkPos < paddlePos - paddleSize)
			checkPos = paddlePos - paddleSize;
		else if (checkPos > paddlePos + paddleSize)
			checkPos = paddlePos + paddleSize;
		return (checkPos);
	}

	private CheckEventScore(): void
	{
		if (this.ball.posX < 0)
			this.EventPlayerScored(this.player2);
		else if (this.ball.posX > 1)
			this.EventPlayerScored(this.player1);
	}

	private EventPlayerScored(player: IPlayer): void
	{
		++player.score;
		if (player.score >= maxScore)
			this.SetGameState(GameState.GAMEOVER);
		else
			this.SetGameState(GameState.NEWBALL);
		this.ball = null;
	}

/* ************************************************************************** *\

	Events

\* ************************************************************************** */

	private EndGame(status: SharedCommunication.PongStatus.Status): void
	{
		console.log(`Pong: Game over for ${this.player1.id} / ${this.player2.id} / ${status}}`);

		clearInterval(this.interval);
		const data: SharedCommunication.PongStatus.IPongStatus = this.GenerateEndData(status);
		const message: string = JSON.stringify(data);

		//send to Kafka
		GameManager.getInstance().kafkaEmit(SharedCommunication.PongStatus.TOPIC, message);

		//send to players
		this.SendToPlayer(this.player1, SharedCommunication.PongStatus.TOPIC, message);
		this.SendToPlayer(this.player2, SharedCommunication.PongStatus.TOPIC, message);
		this.player1.player.button = [];
		this.player2.player.button = [];

		//remove handlers
		this.RemoveAllListeners();

		//delete game
		GameManager.getInstance().removeGame(this);
	}

	private GenerateEndData(status: SharedCommunication.PongStatus.Status): SharedCommunication.PongStatus.IPongStatus
	{
		return ({
			gameType:	GameTypes.PONG,
			matchType:	this.mode,
			status:		status,
			duration:	Date.now() - this.timerGame,
			player1ID:	this.player1.id,
			player1Score:	this.player1.score,
			player2ID:	this.player2.id,
			player2Score:	this.player2.score,
		});
	}
}
