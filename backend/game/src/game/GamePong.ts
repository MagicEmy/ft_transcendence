import { Kafka, Consumer, Producer } from 'kafkajs';

import { Player, Ball, Paddle } from './GamePong.interfaces';
import { GameState, PlayerStatus, Button } from './GamePong.enums';
import { PlayerInfo, IPlayerInfo, SockEventNames, ISockPongImage, ISockPongImagePlayer, ISockPongImageBall, ISockPongHudPlayer, GameTypes, IGameStatus, MatchTypes, GameStatus } from './GamePong.communication';

export class GamePong
{
	private	MatchType:	MatchTypes;
	private	GameState:	GameState;
	private	oldState:	GameState;
	private loopInterval:	any;
	private producer:	Producer;

	player1:	Player;
	player2:	Player;
	ball:		Ball | null;
	private loopCount:	number;

	constructor(player1ID: string, player2ID: string | null, producer: Producer)
	{
		this.producer = producer;
		this.player1 = this.setPlayer(player1ID, "player1", 1/23);
		this.player2 = this.setPlayer(player2ID, "player2", 22/23);
		this.MatchType = MatchTypes.LOCAL;
		this.GameState = GameState.WAITING;
		this.ball = null;

		if (this.validateGame())
		{
			this.loopCount = 0;
			this.loopInterval = setInterval(this.gameLoop.bind(this), 16);
			console.log("Created New Pong game: ", this.player1.id, " vs ", this.player2.id);
		}
	}

	private setPlayer(id: string | null, name: string, posX: number): Player
	{
		const player: Player = 
		{
			client:	(id === null) ? null : undefined,
			id:		id,
			name:	(id === null) ? "Bot" : name,
			paddle:	{posX: posX, posY: 0.5, width: 0.01, height: 0.1, speed: 0.005},
			status:	(id === null) ? PlayerStatus.WAITING : PlayerStatus.CONNECTING,
			score:	0,
			button:	{},
		}
		if (player.id !== null)
			this.requestPlayerName(player.id);
		return (player);
	}

	private validateGame(): boolean
	{
		if (this.player1.id === null &&
			this.player2.id === null)
		{
			this.sendEndGame(GameStatus.BADGAME);
			return (false);
		}
		return (true);
	}

/* ************************************************************************** *\

	Communication

\* ************************************************************************** */

	connectPlayer(id: string, client: any): boolean
	{
		let player: Player;
		if (this.player1.id === id && !this.player1.client)
			player = this.player1;
		else if (this.player2.id === id && !this.player2.client)
			player = this.player2;
		else
			return (false);
		player.client = client;
		this.setToListen(player);
		player.status = PlayerStatus.WAITING;
		this.sendHUDUpdate();
		return (true);
	}

	disconnectPlayer(player: Player)
	{
		this.oldState = this.GameState;
		this.GameState = GameState.PAUSED;
		player.status = PlayerStatus.DISCONNECTED;
		player.client = undefined;
		if (this.player1.client != player.client)
			this.player1.status = PlayerStatus.WAITING;
		if (this.player2.client != player.client)
			this.player2.status = PlayerStatus.WAITING;
		this.sendHUDUpdate();
	}

	private setToListen(player: Player)
	{
		player.client.on("test", () =>
		{
			console.log("I received directly!!!! test");
		});
		player.client.on("disconnect", () =>
		{
			this.disconnectPlayer(player);
			console.log("I received directly!!!! disconnect");
		});
		player.client.on(SockEventNames.BUTTON, (data: string) => { this.handlerButtonEvent(player, data); });
		player.client.on(SockEventNames.PONGIMG, () => { this.handlerImage(player); });
	}

	private handlerButtonEvent(player: Player, data: string)
	{
		const key = JSON.parse(data);

		if (key.press === "keydown")
			player.button[key.code] = true;
		else
			player.button[key.code] = false;
		// console.log(player.name, "[", key.code, " ", key.name, "]\t", player.button[key.code]);
	}

	private handlerImage(player: Player)
	{
		let imageData:	ISockPongImage;

		const P1 = this.handlerImageGetPlayer(this.player1);
		const P2 = this.handlerImageGetPlayer(this.player2);
		const Ball = this.handlerImageGetBall();
		// if (player.client === this.player1.client)
		// 	imageData = { Player1: P1, Player2: P2, Ball: Ball};
		// else
		// {
		// 	imageData = { Player1: P2, Player2: P1, Ball: Ball};
		// 	this.handerImageMirrorXAxis(imageData);
		// }
		// if (player.client.emit)
		// 	player.client.emit(SockEventNames.PONGIMG, JSON.stringify(imageData));
	}

	private handlerImageGetPlayer(player: Player): ISockPongImagePlayer
	{
		const PImg: ISockPongImagePlayer = 
		{
			posX:	player.paddle.posX,
			posY:	player.paddle.posY,
			height:	player.paddle.height,
			width:	player.paddle.width,
			msg:	player.status,
		};

		return (PImg)
	}

	private handlerImageGetBall(): ISockPongImageBall | null
	{
		if (this.ball !== null)
		{
			const Bally: ISockPongImageBall = 
			{
				posX:	this.ball.posX,
				posY:	this.ball.posY,
				posZ:	0,
				size:	this.ball.rad * 2,
			};
			return (Bally);
		}
		return (null);
	}

	private handerImageMirrorXAxis(imageData: ISockPongImage)
	{
		imageData.Player1.posX = 1 - imageData.Player1.posX;
		imageData.Player2.posX = 1 - imageData.Player2.posX;
		if (imageData.Ball !== null)
			imageData.Ball.posX = 1 - imageData.Ball.posX;
	}

	private sendHUDUpdate()
	{
		const P1 = this.sendHUDUpdateGetPlayer(this.player1);
		const P2 = this.sendHUDUpdateGetPlayer(this.player2);
		if (this.player1.client && this.player1.client.emit)
		{
			const HUD = {P1: P1, P2: P2};
			this.player1.client.emit(SockEventNames.PONGHUD, JSON.stringify(HUD));
		}
		if (this.player2.client && this.player2.client.emit)
		{
			const HUD = {P1: P2, P2: P1};
			this.player2.client.emit(SockEventNames.PONGHUD, JSON.stringify(HUD));
		}
	}

	private sendHUDUpdateGetPlayer(player: Player): ISockPongHudPlayer
	{
		const	playerHUD:	ISockPongHudPlayer =
		{
			name:	player.name,
			score:	player.score,
			status:	player.status,
		};
		return (playerHUD);
	}

	private requestPlayerName(id: string | null)
	{
		// console.log("producing:", PlayerInfo.TOPIC, id);
		// if (typeof(id) === "string")
		// {
		// 	const data: IPlayerInfo = {playerID: id};
		// 	this.producer.send(
		// 	{
		// 		topic:	PlayerInfo.TOPIC,
		// 		messages:	[{ value: JSON.stringify(data),}],
		// 	});
		// }
		this.sendToKafka(PlayerInfo.TOPIC, {playerID: id});
	}

	setPlayerName(id: string, name: string)
	{
		if (this.player1.id === id)
			this.player1.name = name;
		if (this.player2.id === id)
			this.player2.name = name;
		this.sendHUDUpdate();
	}

	private	sendEndGame(status: GameStatus)
	{
		const endData: IGameStatus = 
		{
			gameType:	GameTypes.PONG,
			matchType:	this.MatchType,
			status:		status,
			player1ID:		this.player1.id,
			player1Score:	this.player1.score,
			player2ID:		this.player2.id,
			player2Score:	this.player2.score,
		};

		// if (this.producer)
		// {
		// 	this.producer.connect().then(() => {
		// 	  console.log('Producer connected successfully');
		// 	}).catch((error) => {
		// 	  console.error('Error connecting producer:', error);
		// 	});
		// }
		// else
		// {
		// 	console.error('Kafka producer is not properly initialized');
		// }
		
		this.sendToKafka(GameStatus.TOPIC, endData);
		clearInterval(this.loopInterval);
		console.log("Ended Game: ", this.player1.id, " vs ", this.player2.id, "reason: ", endData.status);
		if (this.player1.client && this.player1.client.emit)
			this.player1.client.emit(SockEventNames.ENDGAME, JSON.stringify(endData));
		if (this.player2.client && this.player2.client.emit)
			this.player2.client.emit(SockEventNames.ENDGAME, JSON.stringify(endData));
		// this.producer.send(
		// {
		// 	topic:	GameStatus.TOPIC,
		// 	messages:	[{ value: JSON.stringify(endData),}],
		// });
	}

	private sendToKafka(topic: GameStatus | string, data: any)
	{
		this.producer.send(
			{
				topic:	topic,
				messages:	[{ value: JSON.stringify(data),}],
			}).then(() =>
		{
			// console.log("Game Kafka produced:", topic, JSON.stringify(data));
		}).catch((err: any) =>
		{
			console.error("Error: Kafka send() failed: ", err);
		});
	}

/* ************************************************************************** *\

	GameLoop

\* ************************************************************************** */

	private gameLoop()
	{
		switch (this.GameState)
		{
			case GameState.WAITING:
				this.waitForPlayers();
				break ;
			case GameState.START:
				this.updatePaddles();
				this.pressSpaceToStart();
				this.startGame();
				break ;
			case GameState.NEWBALL:
				this.updatePaddles();
				this.addBall();
				break ;
			case GameState.PLAYING:
				this.updatePaddles();
				const steps: number = 0.0001;
				++this.loopCount;
				for (let speed: number = this.ball.speed; speed > 0; speed -= steps)
				{
					this.updateBallPosition(steps);
					this.checkEventBorder();
					if (this.ball.posX <= 0.5)
						this.checkEventPaddle(this.player1);
					else
						this.checkEventPaddle(this.player2);
				}
				this.checkEventScore();
				break ;
			case GameState.PAUSED:
				this.pausedGame();
				break ;
			case GameState.UNPAUSE:
				this.pressSpaceToStart();
				this.unpauseGame();
				break ;
			case GameState.GAMEOVER:
				// this.checkBotMove();
				clearInterval(this.loopInterval);
				this.sendEndGame(GameStatus.COMPLETED);
				break ;
			default:
				break ;
		}
	}

	private waitForPlayers()
	{
		if (this.player1.status === PlayerStatus.WAITING &&
			this.player2.status === PlayerStatus.WAITING)
		{
			this.player1.status = PlayerStatus.NOTREADY;
			this.player2.status = PlayerStatus.NOTREADY;
			this.GameState = GameState.START;
			this.sendHUDUpdate();
		}
	}

	private pressSpaceToStart()
	{
		if (this.player1.status === PlayerStatus.NOTREADY &&
			((this.player1.client !== null && 
			this.player1.button[Button.SPACE]) || 
			this.player1.client === null))
		{
			this.player1.status = PlayerStatus.READY;
			this.sendHUDUpdate();
		}

		if (this.player2.status === PlayerStatus.NOTREADY &&
			((this.player2.client !== null && 
			this.player2.button[Button.SPACE]) || 
			this.player2.client === null))
		{
			this.player2.status = PlayerStatus.READY;
			this.sendHUDUpdate();
		}
	}
	
	private startGame()
	{
		if (this.player1.status === PlayerStatus.READY &&
			this.player2.status === PlayerStatus.READY)
		{
			this.player1.status = PlayerStatus.PLAYING;
			this.player2.status = PlayerStatus.PLAYING;
			this.GameState = GameState.NEWBALL;
			this.sendHUDUpdate();
		}
	}

	private	pausedGame()
	{
		// console.log("player1:\t", this.player1.status, "player2:\t", this.player2.status);
		if (this.player1.status === PlayerStatus.WAITING &&
			this.player2.status === PlayerStatus.WAITING)
		{
			this.player1.status = PlayerStatus.NOTREADY;
			this.player2.status = PlayerStatus.NOTREADY;
			this.GameState = GameState.UNPAUSE;
			this.sendHUDUpdate();
		}
	}

	private unpauseGame()
	{
		if (this.player1.status === PlayerStatus.READY &&
			this.player2.status === PlayerStatus.READY)
		{
			this.GameState = this.oldState;
			this.sendHUDUpdate();
		}
	}

/* ************************************************************************** *\

	Player

\* ************************************************************************** */

	private updatePaddles()
	{
		if (this.GameState === GameState.PAUSED ||
			this.GameState === GameState.UNPAUSE ||
			this.GameState === GameState.GAMEOVER)
			return ;

		if (this.player1.client === null)
			this.botPressArrowKey(this.player1);
		if (this.player2.client === null)
			this.botPressArrowKey(this.player2);

		if (this.player1.id === this.player2.id)
			this.updatePaddleLocal();
		else
		{
			this.updatePaddle(this.player1);
			this.updatePaddle(this.player2);
		}
	}

	private botPressArrowKey(player: Player)
	{
		let posY: number;

		if (this.ball !== null)
			posY = this.ball.posY;
		else
			posY = 0.5;
		player.button[Button.ARROWUP] = posY < player.paddle.posY;
		player.button[Button.ARROWDOWN] = posY > player.paddle.posY;
	}

	private	updatePaddle(player: Player)
	{
		let	moveY: number = 0;

		if (player.button[Button.ARROWUP] || player.button[Button.w])
			moveY -= player.paddle.speed;
		if (player.button[Button.ARROWDOWN] || player.button[Button.s])
			moveY += player.paddle.speed;

		this.updatePaddlePos(player.paddle, moveY);

		// if (newPos + player.paddle.height / 2 > 1)
		// 	newPos = 1 - player.paddle.height / 2;
		// else if (newPos - player.paddle.height / 2 < 0)
		// 	newPos = player.paddle.height / 2;

		// player.paddle.posY = newPos;
	}

	private updatePaddleLocal()
	{
		let moveY = 0;

		if (this.player1.button[Button.w])
			moveY += this.player1.paddle.speed;
		if (this.player1.button[Button.s])
			moveY -= this.player1.paddle.speed;
		this.updatePaddlePos(this.player1.paddle, moveY);

		moveY = 0;
		if (this.player2.button[Button.ARROWUP])
			moveY += this.player2.paddle.speed;
		if (this.player2.button[Button.ARROWDOWN])
			moveY -= this.player2.paddle.speed;
		this.updatePaddlePos(this.player2.paddle, moveY);
	}

	private updatePaddlePos(paddle: Paddle, moveY: number)
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

	private addBall()
	{
		if (this.ball === null)
		{
			let starter: number;
			if (this.player1.score === this.player2.score)
			{
				if (this.player1.score === 0)
					starter = 2;
				else
					starter = Math.round(Math.random());
			}
			else if (this.player1.score < this.player2.score)
				starter = 0;
			else
				starter = 1;

			// console.log("starter\t", starter);
			switch (starter)
			{
				case 0:
					// console.log("case 0");
					this.addBallRandom();
					break ;
				case 1:
					// console.log("case 1");
					this.addBallRandom();
					break ;
				case 2:
					// console.log("case 2");
					this.addBallRandom();
					break ;
				default:
					return ;
			}
			this.GameState = GameState.PLAYING;
		}
	}

	private addBallRandom()
	{
		// console.log("Addballrandom");
		this.ball =
		{
			posX:	0.5,
			posY:	0.5,
			rad:	0.0025,
			speed:	0.002,
			maxSpeed:	0.010,
			angle:	0.5 * Math.PI,
		};

		this.ball.speed = 0.0075;

		this.ball.angle = Math.random() + 0.25;
		if (this.ball.angle >= 0.75)
			this.ball.angle += 0.5;
		this.ball.angle *= Math.PI;

		// this.ball.posX = 1/23;
		// this.ball.posY = 0.75;
		// this.ball.angle = 0.00 * Math.PI;
	}

	private	updateBallPosition(move: number)
	{
		const	circle: number = Math.PI * 2;
		if (this.ball.angle < 0)
			this.ball.angle += circle;
		if (this.ball.angle > circle)
			this.ball.angle -= circle;
		this.ball.posX += Math.sin(this.ball.angle) * move;
		this.ball.posY -= Math.cos(this.ball.angle) * move;
	}

	private adjustBallAngle(hit: string)
	{
		switch(hit)
		{
			case "horizontal":
				if (this.ball.angle <= Math.PI)
					this.ball.angle = Math.PI - this.ball.angle;
				else
					this.ball.angle = Math.PI + (Math.PI * 2 - this.ball.angle);
				break ;
			case "vertical":
					this.ball.angle = Math.PI * 2 - this.ball.angle;
					// if (this.ball.posX < 0.5)
					// 	this.ball.posX = this.player1.paddle.posX + (this.player1.paddle.width * 2);
					// else
					// 	this.ball.posX = this.player2.paddle.posX - (this.player1.paddle.width * 2);
				break ;
			default: console.error("adjustBallAngle has no case for", hit);
		}
	}

/* ************************************************************************** *\

	Events

\* ************************************************************************** */

	// private	checkBotMove()
	// {
	// 	if (this.player1.client === null)
	// 		this.makeBotMovePlayer(this.player1)
	// 	if (this.player2.client === null)
	// 		this.makeBotMovePlayer(this.player2)
	// }

	// private makeBotMovePlayer(player: Player)
	// {
	// 	let posY: number;

	// 	if (this.ball !== null)
	// 		posY = this.ball.posY;
	// 	else
	// 		posY = 0.5;
	// 	player.button[Button.ARROWUP] = posY < player.paddle.posY;
	// 	player.button[Button.ARROWDOWN] = posY > player.paddle.posY;
	// }

	private checkEventBorder()
	{
		if (this.ball.posY - this.ball.rad < 0 ||
			this.ball.posY + this.ball.rad > 1)
			this.adjustBallAngle("horizontal");
	}

	private checkEventPaddle(player: Player)
	{
		let checkX: number = this.checkEventCheckPoint(this.ball.posX, player.paddle.posX, player.paddle.width / 2);
		let checkY: number = this.checkEventCheckPoint(this.ball.posY, player.paddle.posY, player.paddle.height / 2);
		let distance = Math.sqrt(Math.pow(this.ball.posX - checkX, 2) + Math.pow(this.ball.posY - checkY, 2));
		if (distance <= this.ball.rad)
		{
			if (checkX != this.ball.posX)
			{
				if (this.loopCount)
				{
					this.adjustBallAngle("vertical");
					this.ball.angle += Math.atan((checkY - player.paddle.posY) /
												(checkX - player.paddle.posX)) / 3;
					this.ball.speed = this.ball.speed * 0.95 + this.ball.maxSpeed * 0.05;
					this.loopCount = 0;
				}
			}
			else
			{
				this.adjustBallAngle("horizontal");
			}
		}
	}

	private checkEventCheckPoint(ballPos: number, paddlePos: number, paddleSize: number): number
	{
		let checkPos: number = ballPos;

		if (checkPos < paddlePos - paddleSize)
			checkPos = paddlePos - paddleSize;
		else if (checkPos > paddlePos + paddleSize)
			checkPos = paddlePos + paddleSize;
		return (checkPos);
	}

	private	checkEventScore()
	{
		let score:	boolean = false;

		if (this.ball.posX < 0)
		{
			++this.player2.score;
			score = true;
		}
		else if (this.ball.posX > 1)
		{
			++this.player1.score;
			score = true;
		}

		if (score)
		{
			this.ball = null;
			if (this.player1.score >= 1 ||
				this.player2.score >= 1)
				this.GameState = GameState.GAMEOVER;
			else
				this.GameState = GameState.NEWBALL;
			this.sendHUDUpdate();
		}
	}
}
