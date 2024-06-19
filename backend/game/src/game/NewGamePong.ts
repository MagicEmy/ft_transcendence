import { GamePlayer } from "./GamePlayer";
import { IGame } from "./IGame";
import { PlayerInfo, IPlayerInfo, SockEventNames, ISockPongImage, ISockPongImagePlayer, ISockPongImageBall, ISockPongHudPlayer, GameTypes, IGameStatus, MatchTypes, GameStatus } from './GamePong.communication';
import { Button, GameState, PlayerStatus } from "./GamePong.enums";

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
	lastEvent:	number;
}

const FLAGS =
{
	NAME:	"Pong",
	FLAG:	"PONG",
	SOLO:
	{
		NAME: "Solo",
		FLAG: "PongGameSolo"
	},
	LOCAL:
	{
		NAME: "Local",
		FLAG: "PongGameLocal"
	},
	MATCH:
	{
		NAME: "Match",
		FLAG: "PongGameMatch"
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
	private timer: number;
	private interval: any;

	constructor(data: string[], players: string[])
	{
		console.log(`Creating new pong game ${data}/${players}`);
		this.mode = data[0];
		this.theme = data[1];
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
		this.gameState = GameState.WAITING;
		this.timer = Date.now();
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
		if (playerToAdd.getId() === this.player1.id)
			playerPos = this.player1;
		else if (playerToAdd.getId() === this.player2.id)
			playerPos = this.player2;
		if (playerPos === undefined)
			return (false);
		playerPos.player = playerToAdd;
		this.AddListerners(playerPos, playerToAdd.getClient());
		playerPos.status = PlayerStatus.WAITING;
		this.sendHUD();
		return (true);
	}

	public PlayerIsInGame(player: GamePlayer): boolean
	{
		return (this.player1.player.getId() == player.getId() ||
				this.player2.player.getId() == player.getId());
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
		if (this.player1.player?.getClient() && 
			this.player1.player.getClient().emit)
		{
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

	private SendGameOver(): void
	{

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
		clearInterval(this.interval);
		const data: IGameStatus = this.GenerateEndData(GameStatus.COMPLETED);
		// this.SendGameOverToKafka(data);
		// this.EmitToPlayers(data);
		// this.TellManagerToCleanUp();
		console.log("GameOver mode");
	}

	private GenerateEndData(status: GameStatus): IGameStatus
	{
		console.error("Matchtypes hardcoded");
		return ({
			gameType:	GameTypes.PONG,
			matchType:	MatchTypes.LOCAL,
			status:		status,
			player1ID:	this.player1.id,
			player1Score:	this.player1.score,
			player2ID:	this.player2.id,
			player2Score:	this.player2.score,
		});
	}

/* ************************************************************************** *\

	Player

\* ************************************************************************** */

	private UpdatePaddles(): void
	{
		this.BotKeyPress();

		switch (this.mode)
		{
			case FLAGS.SOLO.FLAG:
				this.BotKeyPress();
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

	private BotKeyPress(): void
	{
		if (this.mode !== FLAGS.SOLO.FLAG)
			return;

		let posY = this.ball !== null ? this.ball.posY : 0.5;
		this.player2.player.button[Button.ARROWUP] = posY < this.player2.paddle.posY;
		this.player2.player.button[Button.ARROWDOWN] = posY > this.player2.paddle.posY;
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
			rad:	0.0025,
			speed:	0.002,
			maxSpeed:	0.010,
			angle:	0.5 * Math.PI,
			lastEvent:	0,
		};

		this.ball.angle = Math.random() + 0.25;
		if (this.ball.angle >= 0.75)
			this.ball.angle += 0.5;
		this.ball.angle *= Math.PI;
	}

	private UpdateBall(): void
	{
		const steps: number = this.player1.paddle.width / 10;

		++this.ball.lastEvent;
		for (let speed: number = this.ball.speed; speed > 0; speed -= steps)
		{
			this.UpdateBallPosition(steps);
			this.CheckEventBorder();
			if (this.ball.posX <= 0.5)
				this.CheckEventPaddle(this.player1.paddle);
			else
				this.CheckEventPaddle(this.player2.paddle);
		}
	}

	private UpdateBallPosition(move: number): void
	{
		const	circle: number = Math.PI * 2;
		if (this.ball.angle < 0)
			this.ball.angle += circle;
		if (this.ball.angle > circle)
			this.ball.angle -= circle;
		this.ball.posX += Math.sin(this.ball.angle) * move;
		this.ball.posY -= Math.cos(this.ball.angle) * move;
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
				if (this.ball.lastEvent > 10)
				{
					this.AdjustBallAngle("vertical");
					this.ball.angle += Math.atan((checkY - paddle.posY) /
												(checkX - paddle.posX)) / 3;
					this.ball.speed = this.ball.speed * 0.90 + this.ball.maxSpeed * 0.10;
					this.ball.lastEvent = 0;
				}
			}
			else
			{
				this.AdjustBallAngle("horizontal");
			}
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
		if (player.score >= 11)
			this.gameState = GameState.GAMEOVER;
		else
			this.gameState = GameState.NEWBALL;
		this.ball = null;
		this.sendHUD();
	}

}
