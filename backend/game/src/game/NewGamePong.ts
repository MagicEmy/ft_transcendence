import { GamePlayer } from "./GamePlayer";
import { IGame } from "./IGame";
import { PlayerInfo, IPlayerInfo, SockEventNames, ISockPongImage, ISockPongImagePlayer, ISockPongImageBall, ISockPongHudPlayer, GameTypes, IGameStatus, MatchTypes, GameStatus } from './GamePong.communication';
import { Button, GameState, PlayerStatus } from "./GamePong.enums";
import { GameManager } from "./NewGameManager";
import { Socket } from 'socket.io';

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
	posZ:	number;
	rad:	number;
	speed:	number;
	maxSpeed:	number;
	angle:	number;
	// lastEvent:	number;
	lastHit:	Paddle | null;
	lastPaddle:	Paddle | null;
}

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
	private mode: string;
	private theme: string;
	private player1: Player;
	private player2: Player;
	private ball: Ball | null;
	private interval: any;

	private id: string = Math.random().toString(36).substr(2, 9);

	private timerGame: number = Date.now();
	private timerEvent: number = Date.now();

	constructor(data: string[], players: string[])
	{
		console.log(`Creating new pong game ${data}/${players}`);
		this.mode = data[0];
		this.theme = data[1];
		let player1: string;
		let player2: string | null = null;


		console.log(`validating game mode [${this.mode}]`);
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
		console.log(`constructing player 1 [${player1}]`);
		this.player1 = this.ConstructPlayer(player1, 1/23);
		console.log(`constructing player 2 [${player2}]`);
		this.player2 = this.ConstructPlayer(player2, 22/23);
		console.log(`preparing game`);
		this.ball = null;
		this.gameState = GameState.WAITING;
		this.timerGame = Date.now();
		this.timerEvent = Date.now();
		console.log(`binding methods`);
		this.interval = setInterval(this.GameLoop.bind(this), 16);
	}

	private ConstructPlayer(playerId: any, posX: number): Player
	{
		// console.log(`${playerId}`);
		const player: Player =
		{
			player:	(playerId !== null) ? null : new GamePlayer(null, null),
			id:		(playerId !== null) ? playerId : null,
			paddle:	{posX: posX, posY: 0.5, width: 0.01, height: 0.1, speed: 0.005},
			status:	(playerId !== null) ? PlayerStatus.CONNECTING : PlayerStatus.WAITING,
			score:	0,
		}
		// console.log(`player ${player === null}/${player.player}/${player.id}/${player.status}/${player.paddle.posX}`);
		return (player);
	}

	public AddPlayer(playerToAdd: GamePlayer): boolean
	{
		console.log("Adding player to pong");
		let playerPos: Player;
		if (playerToAdd?.getId() === this.player1.id)
			playerPos = this.player1;
		else if (playerToAdd?.getId() === this.player2.id)
			playerPos = this.player2;
		if (playerPos === undefined)
			return (false);
		playerPos.player = playerToAdd;
		this.AddListerners(playerPos, playerToAdd.getClient());
		playerPos.status = PlayerStatus.WAITING;
		this.sendHUD();
//TODOKAFKA: add kafka to inform player is playing
		return (true);
	}

	public PlayerIsInGame(player: GamePlayer): boolean
	{
		return (this.player1.player?.getId() == player.getId() ||
				this.player2.player?.getId() == player.getId());
	}

	public clearGame(): void
	{
		console.log(`removing ${this.id}`);
		if (this.player1.player.getClient())
			this.RemoveListeners(this.player1.player.getClient());
		if (this.player2.player.getClient())
			this.RemoveListeners(this.player2.player.getClient());
	}

/* ************************************************************************** *\

	Socket Listeners

\* ************************************************************************** */
private ImageHandlers = new Map<Socket, (client: Socket) => void>();
private DisconnectHandlers = new Map<Socket, (client: Socket) => void>();

	private AddListerners(player: Player, client: Socket): void
	{
		var handler: any;

		handler = () => this.handlerImage(client);
		this.ImageHandlers.set(client, handler);
		client.on("GameImage", handler);

		handler = () => this.handlerDisconnect(client);
		this.DisconnectHandlers.set(client, handler);
		client.on("disconnect", handler);
	}

	private RemoveListeners(client: Socket): void
	{
		var handler: any;

		handler = this.ImageHandlers.get(client);
		if (handler)
		{
			client.off("GameImage", handler);
			this.ImageHandlers.delete(client);
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
			client.off("GameImage", handler)
			this.ImageHandlers.delete(client);
		});
		this.DisconnectHandlers.forEach((handler, client) =>
		{
			client.off("disconnect", handler)
			this.DisconnectHandlers.delete(client);
		});
	}

	private handlerDisconnect(client: Socket): void
	{
		console.log("GamePong: disconnect", client.id);
		this.RemoveListeners(client);
	}

	private handlerImage(client: Socket): void
	{
		console.log(`image ID ${this.id}`);
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
// console.warn("need to adjust note pong");
		if (this.player1.player.getClient() === client)
			imageData = { Game: GamePong.gameFlag, Theme: this.theme,
							Player1: P1, Player2: P2, Ball: ball};
		else
		{
			imageData = { Game: GamePong.gameFlag, Theme: this.theme,
							Player1: P2, Player2: P1, Ball: ball};
			this.MirrorImageDataXAxis(imageData);
		}
		// console.log(`sendImage ${client}`);
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
			return({
				posX: this.ball.posX,
				posY: this.ball.posY,
				posZ: this.ball.posZ,
				size: this.ball.rad * 2,
			});
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

		// console.log("Seinding hud");
		this.SendToPlayer(this.player1, "GameHUD", JSON.stringify({game: "pong", P1: P1, P2: P2}));
		this.SendToPlayer(this.player2, "GameHUD", JSON.stringify({game: "pong", P1: P2, P2: P1}));
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

	// private SendGameState(state :GameState): void
	// {
	// 	const data = 
	// 	{
	// 		GameState:	state,
	// 		Player1:	this.player1.id,
	// 		Player1Score:	this.player1.score,
	// 		Player2:	this.player2.id,
	// 		Player2Score:	this.player2.score,
	// 		message:	"",
	// 	};

	// 	switch (state)
	// 	{
	// 		case GameState.GAMEOVER:
	// 			data.message = this.player1.score > this.player2.score ? "You won" : "You lost";
	// 			this.SendToPlayer(this.player1, "GameState", JSON.stringify(data));
	// 			data.message = this.player2.score > this.player1.score ? "You won" : "You lost";
	// 			this.SendToPlayer(this.player2, "GameState", JSON.stringify(data));
	// 			break ;
	// 		default:
	// 			const message: string = JSON.stringify(data);
	// 			this.SendToPlayer(this.player1, "GameState", message);
	// 			this.SendToPlayer(this.player2, "GameState", message);
	// 			break ;
	// 	}
	// }

	private SendToPlayer(player: Player, flag: string, msg: string)
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

/* ************************************************************************** *\
	GameLoop - Waiting
\* ************************************************************************** */

	private GameLoopWaiting(): void
	{
		if (this.player1.status === PlayerStatus.WAITING &&
			this.player2.status === PlayerStatus.WAITING)
		{
			this.player1.status = PlayerStatus.NOTREADY;
			this.player2.status = PlayerStatus.NOTREADY;
			this.gameState = GameState.START;
		}
		else if (this.timerEvent + 60000 < Date.now()) // 60 seconds
			this.EndGame(GameStatus.NOCONNECT);
	}

/* ************************************************************************** *\
	GameLoop - Start
\* ************************************************************************** */

	private GameLoopStart(): void
	{
		this.PressSpaceToStart();
		this.UpdatePaddles();
		this.StartGame();
	}

	private PressSpaceToStart()
	{
		if (this.player1.status === PlayerStatus.NOTREADY &&
			this.player1.player.button[Button.SPACE])
		{
			this.player1.status = PlayerStatus.READY;
			this.sendHUD();
		}

		if (this.player2.status === PlayerStatus.NOTREADY &&
			(this.player2.player.button[Button.SPACE] ||
			this.player2.id === null))
		{
			this.player2.status = PlayerStatus.READY;
			this.sendHUD();
		}
	}

	private StartGame(): void
	{
		if (this.player1.status === PlayerStatus.READY &&
			this.player2.status === PlayerStatus.READY)
		{
			this.player1.status = PlayerStatus.PLAYING;
			this.player2.status = PlayerStatus.PLAYING;
			this.gameState = GameState.NEWBALL;
			this.timerGame = Date.now();
			this.sendHUD();
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
		console.log("Paused mode");
	}

/* ************************************************************************** *\
	GameLoop - Unpause
\* ************************************************************************** */

	private GameLoopUnpause(): void
	{
		console.log("Unpause mode");
	}

/* ************************************************************************** *\
	GameLoop - Game Over
\* ************************************************************************** */

	private GameLoopGameOver(): void
	{
		this.EndGame(GameStatus.COMPLETED);
	}

	// private GenerateEndData(status: GameStatus): IGameStatus
	// {
	// 	console.error("Matchtypes hardcoded");
	// 	return ({
	// 		gameType:	GameTypes.PONG,
	// 		matchType:	MatchTypes.LOCAL,
	// 		status:		status,
	// 		player1ID:	this.player1.id,
	// 		player1Score:	this.player1.score,
	// 		player2ID:	this.player2.id,
	// 		player2Score:	this.player2.score,
	// 	});
	// }

	// private SendGameOverToKafka(topic: GameStatus, data: IGameStatus)
	// {
		
	// 	GameManager.getInstance().kafkaEmit(topic, JSON.stringify(data));
	// }

/* ************************************************************************** *\

	Player

\* ************************************************************************** */

	private UpdatePaddles(): void
	{
		switch (this.mode)
		{
			case FLAGS.SOLO.FLAG:
				this.BotKeyPress(this.player2);
				this.UpdatePaddle(this.player1.paddle, this.player1.player.button, this.player1.player.button);
				this.UpdatePaddle(this.player2.paddle, null, this.player2.player.button);
				break ;
			case FLAGS.LOCAL.FLAG:
				this.UpdatePaddle(this.player1.paddle, this.player1.player.button, null);
				this.UpdatePaddle(this.player2.paddle, null, this.player1.player.button);
				break ;
			default:
				this.UpdatePaddle(this.player1.paddle, this.player1.player.button, this.player1.player.button);
				this.UpdatePaddle(this.player2.paddle, this.player2.player.button, this.player2.player.button);
				break ;
		}
	}

	private BotKeyPress(bot: Player): void
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

	private UpdatePaddle(paddle: Paddle, wasd: { [key: number]: boolean } | null, arrows: { [key: number]: boolean } | null)
	{
		let moveY: number = 0;

		if ((wasd !== null && wasd[Button.w]) || 
			(arrows !== null && arrows[Button.ARROWUP]))
			moveY -= paddle.speed;
			if ((wasd !== null && wasd[Button.s]) || 
				(arrows !== null && arrows[Button.ARROWDOWN]))
			moveY += paddle.speed;
		this.UpdatePaddlePos(paddle, moveY);
	}

	private UpdatePaddlePos(paddle: Paddle, moveY: number)
	{
		paddle.posY += moveY;

		if (paddle.posY + paddle.height / 2 > 1)
			paddle.posY = 1 - paddle.height / 2;
		else if (paddle.posY - paddle.height / 2 < 0)
			paddle.posY = paddle.height / 2;
	}

/* ************************************************************************** *\

	Ball

\* ************************************************************************** */

	private AddBall(): void
	{
		if (this.ball !== null)
			return ;

		this.AddBallRandom();
		this.gameState = GameState.PLAYING;
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
			angle:	0.5 * Math.PI,
			// lastEvent:	0,
			lastHit:	null,
			lastPaddle:	null,
		};

		this.ball.angle = Math.random() + 0.25;
		this.ball.angle = 0.5;//REMOVE
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
		this.FixBallRadial();
		let move: number = this.CalculateNearestEvent(remaining);
		if (move === remaining)
			move -= this.ball.rad;
		if (move <= 0)
			move = this.player1.paddle.width / 10;
		this.ball.posX += Math.sin(this.ball.angle) * move;
		this.ball.posY -= Math.cos(this.ball.angle) * move;
		return (move);
	}
	
	private FixBallRadial(): void
	{
		const circle: number = Math.PI * 2;

		if (this.ball.angle < 0)
			this.ball.angle += circle;
		if (this.ball.angle > circle)
			this.ball.angle -= circle;
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
				break ;
			case "vertical":
					this.ball.angle = Math.PI * 2 - this.ball.angle;
				break ;
			default:
				console.error(`AdjustBallAngle() has no case for '${direction}`);
				break ;
		}
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
		//height = -8/3x^2 + 2/3x + 1
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

	private CheckEventPaddle(paddle: Paddle): void
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
			{
				this.AdjustBallAngle("horizontal");
			}
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

	private EventPlayerScored(player: Player): void
	{
		++player.score;
		if (player.score >= 1)//11!
			this.gameState = GameState.GAMEOVER;
		else
			this.gameState = GameState.NEWBALL;
		this.ball = null;
		this.sendHUD();
	}

/* ************************************************************************** *\

	Events

\* ************************************************************************** */

	private EndGame(status: GameStatus): void
	{
		console.log(`Game over for ${this.player1.id} / ${this.player2.id} / ${status}}`);

		clearInterval(this.interval);
		const data: IGameStatus = this.GenerateEndData(status);
		const message: string = JSON.stringify(data);

		//send to Kafka
		GameManager.getInstance().kafkaEmit(GameStatus.TOPIC, message);

		//send to players
		this.SendToPlayer(this.player1, GameStatus.TOPIC, message);
		this.SendToPlayer(this.player2, GameStatus.TOPIC, message);

		//remove handlers
		this.RemoveAllListeners();

		//delete game
		GameManager.getInstance().removeGame(this);
	}

	private GenerateEndData(status: GameStatus): IGameStatus
	{
		console.error("Matchtypes hardcoded");
		return ({
			gameType:	GameTypes.PONG,
			matchType:	MatchTypes.LOCAL,
			status:		status,
			duration:	Date.now() - this.timerGame,
			player1ID:	this.player1.id,
			player1Score:	this.player1.score,
			player2ID:	this.player2.id,
			player2Score:	this.player2.score,
		});
	}

}
