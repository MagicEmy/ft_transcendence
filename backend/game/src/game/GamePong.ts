import { Consumer, Producer } from 'kafkajs';

interface	Player
{
	client:	any | null;
	id:		any;
	name:	string;
	paddle: Paddle;
	status:	string;
	score:	number;
	button:	{[key: number]: boolean};
}

interface	Paddle
{
	posX:	number;
	posY:	number;
	width:	number;
	height:	number;
	speed:	number;
}

interface	Ball
{
	posX:	number;
	posY:	number;
	rad:	number;
	speed:	number;
	maxSpeed:	number;
	angle:	number;
}

enum	PlayerStatus
{
	DISCONNECTED = "Disconnected",
	CONNECTING = "Connecting",
	WAITING = "Waiting",
	NOTREADY = "Press Space to Start",
	READY = "Ready",
	PLAYING = " ",
}

enum	GameStatus
{
	WAITING,
	START,
	NEWBALL,
	PLAYING,
	GAMEOVER,
}

enum	Button
{
	SPACE = 32,
	ARROWUP = 38,
	ARROWDOWN = 40,
	s = 83,
	w = 87,
}

export class GamePong
{
	private	gameStatus:	GameStatus;
	private loopInterval:	any;
	player1:	Player;
	player2:	Player;
	ball:		Ball | null;
	producer:	Producer;
	consumer:	Consumer;

	constructor(player1: string, player2: string | null, producer: Producer, consumer: Consumer)
	{
		this.gameStatus = GameStatus.WAITING;
		this.player1 = 
		{
			client: undefined,
			id:		null,
			name:	player1,
			paddle: {posX: 1/23, posY: 0.5, width: 0.01, height: 0.1, speed: 0.005},
			status:	PlayerStatus.CONNECTING,
			score:	0,
			button:	{},
		};
		this.player2 = 
		{
			client: (player2 === null) ? null : undefined,
			id:		null,
			name:	player2,
			paddle: {posX: 22/23, posY: 0.5, width: 0.01, height: 0.1, speed: 0.005},
			status:	(player2 === null) ? PlayerStatus.WAITING : PlayerStatus.CONNECTING,
			score:	0,
			button:	{},
		}
		this.ball = null;
		this.producer = producer;
		this.consumer = consumer;
		this.loopInterval = setInterval(this.gameLoop.bind(this), 16);
		console.log("Created New Pong game: ", this.player1.name, " vs ", this.player2.name);
	}

/* ************************************************************************** *\

	Communication

\* ************************************************************************** */

	connectPlayer(name: string, client: any): boolean
	{
		let player: Player;
		if (this.player1.name === name && !this.player1.client)
			player = this.player1;
		else if (this.player2.name === name && !this.player2.client)
			player = this.player2;
		else
			return (false);
		player.client = client;
		this.setToListen(player);
		player.status = PlayerStatus.WAITING;
		this.sendHUDUpdate();
		return (true);
	}

	private setToListen(player: Player)
	{
		player.client.on("test", () =>
		{
			console.log("I received directly!!!!");
		});
		player.client.on("button", (data: string) => { this.handlerButtonEvent(player, data); });
		player.client.on("image", () => { this.handlerImage(player); });
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
		const P1 = 
		{
			posX:	this.player1.paddle.posX,
			posY:	this.player1.paddle.posY,
			height:	this.player1.paddle.height,
			width:	this.player1.paddle.width,
			msg:	this.player1.status,
		};
		const P2 = 
		{
			posX:	this.player2.paddle.posX,
			posY:	this.player2.paddle.posY,
			height:	this.player2.paddle.height,
			width:	this.player2.paddle.width,
			msg:	this.player2.status,
		};
		let Ball = null;
		if (this.ball !== null)
		{
			Ball =
			{
				posX:	this.ball.posX,
				posY:	this.ball.posY,
				size:	this.ball.rad,
			};
		}

		if (player.client.emit)
		{
			if (player.client === this.player1.client)
			{
				const data = 
				{
					Player1: P1,
					Player2: P2,
					Ball:	Ball,
				};
				player.client.emit("pong", JSON.stringify(data));
			}
			else
			{
				const data =
				{
					Player1: P2,
					Player2: P1,
					Ball: Ball,
				};
				data.Player1.posX = 1 - data.Player1.posX;
				data.Player2.posX = 1 - data.Player2.posX;
				data.Ball.posX = 1 - data.Ball.posX;
				player.client.emit("pong", JSON.stringify(data));
			}
		}

	}

	private	sendHUDUpdate()
	{
		// console.log("emitting hud");
		const P1 =
		{
			name:	this.player1.name,
			score:	this.player1.score,
			status:	this.player1.status,
		}
		const P2 =
		{
			name:	this.player2.name,
			score:	this.player2.score,
			status:	this.player2.status,
		}
		if (this.player2.name === null)
			P2.name = "Bot";
		if (this.player1.client && this.player1.client.emit)
		{
			const HUD =
			{
				P1:	P1,
				P2: P2,
			};
			this.player1.client.emit("pongHUD", JSON.stringify(HUD));
		}
		if (this.player2.client && this.player2.client.emit)
		{
			const HUD = 
			{
				P1: P2,
				P2: P1,
			};
			this.player2.client.emit("pongHUD", JSON.stringify(HUD));
		}
	}

	private	sendEndGame(status: string)
	{
		this.producer.send(
		{
			topic:	"game_end",
			messages:	[{ value: JSON.stringify(
			{
				gameType:	"pong",
				player1ID:		this.player1.id,
				player1Score:	this.player1.score,
				player2ID:		this.player2.id,
				player2Score:	this.player2.score,
				status:			status,
			}),}]
		});
	}

/* ************************************************************************** *\

	GameLoop

\* ************************************************************************** */

	private gameLoop()
	{
		this.updatePaddle(this.player1);
		this.updatePaddle(this.player2);
		switch (this.gameStatus)
		{
			case GameStatus.WAITING:
				this.waitForPlayers();
				break ;
			case GameStatus.START:
				this.pressSpaceToStart();
				break ;
			case GameStatus.NEWBALL:
				this.checkBotMove();
				this.addBall();
				break ;
			case GameStatus.PLAYING:
				this.checkBotMove();
				const steps: number = 0.0001
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
			case GameStatus.GAMEOVER:
				// this.checkBotMove();
				clearInterval(this.loopInterval);
				this.sendEndGame("winner");
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
			this.gameStatus = GameStatus.START;
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

		if (this.player1.status === PlayerStatus.READY &&
			this.player2.status === PlayerStatus.READY)
		{
			this.player1.status = PlayerStatus.PLAYING;
			this.player2.status = PlayerStatus.PLAYING;
			this.gameStatus = GameStatus.NEWBALL;
			this.sendHUDUpdate();
		}
	}

/* ************************************************************************** *\

	Player

\* ************************************************************************** */

	private	updatePaddle(player: Player)
	{
		let	newPos: number = player.paddle.posY;

		if (player.button[Button.ARROWUP] || player.button[Button.w])
			newPos -= player.paddle.speed;
		if (player.button[Button.ARROWDOWN] || player.button[Button.s])
			newPos += player.paddle.speed;

		if (newPos + player.paddle.height / 2 > 1)
			newPos = 1 - player.paddle.height / 2;
		else if (newPos - player.paddle.height / 2 < 0)
			newPos = player.paddle.height / 2;

		player.paddle.posY = newPos;
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

			console.log("starter\t", starter);
			switch (starter)
			{
				case 0:
					console.log("case 0");
					this.addBallRandom();
					break ;
				case 1:
					console.log("case 1");
					this.addBallRandom();
					break ;
				case 2:
					console.log("case 2");
					this.addBallRandom();
					break ;
				default:
					return ;
			}
			this.gameStatus = GameStatus.PLAYING;
		}
	}

	private addBallRandom()
	{
		console.log("Addballrandom");
		this.ball =
		{
			posX:	0.5,
			posY:	0.5,
			rad:	0.0025,
			speed:	0.002,
			maxSpeed:	0.010,
			angle:	0.5 * Math.PI,
		};

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
				break ;
			default: console.error("adjustBallAngle has no case for", hit);
		}
	}


/* ************************************************************************** *\

	Events

\* ************************************************************************** */

	private	checkBotMove()
	{
		if (this.player1.client === null)
			this.makeBotMovePlayer(this.player1)
		if (this.player2.client === null)
			this.makeBotMovePlayer(this.player2)
	}

	private makeBotMovePlayer(player: Player)
	{
		let posY: number;

		if (this.ball !== null)
			posY = this.ball.posY;
		else
			posY = 0.5;
		player.button[Button.ARROWUP] = posY < player.paddle.posY;
		player.button[Button.ARROWDOWN] = posY > player.paddle.posY;
	}

	private checkEventBorder()
	{
		if (this.ball.posY - this.ball.rad < 0 ||
			this.ball.posY + this.ball.rad > 1)
			this.adjustBallAngle("horizontal");
	}

	private checkEventPaddle(player: Player)
	{
		let checkX = this.ball.posX;
		let checkY = this.ball.posY;

		if (checkX < player.paddle.posX - (player.paddle.width / 2))
			checkX = player.paddle.posX - (player.paddle.width / 2);
		else if (checkX > player.paddle.posX + (player.paddle.width / 2))
			checkX = player.paddle.posX + (player.paddle.width / 2);
		if (checkY < player.paddle.posY - (player.paddle.height / 2))
			checkY = player.paddle.posY - (player.paddle.height / 2);
		else if (checkY > player.paddle.posY + (player.paddle.height / 2))
			checkY = player.paddle.posY + (player.paddle.height / 2);

		let distance = Math.sqrt(Math.pow(this.ball.posX - checkX, 2) + Math.pow(this.ball.posY - checkY, 2));
		if (distance <= this.ball.rad)
		{
			if (checkX != this.ball.posX)
			{
				this.adjustBallAngle("vertical");
				this.ball.angle += Math.atan((checkY - player.paddle.posY) /
											(checkX - player.paddle.posX)) / 3;
				this.ball.speed = this.ball.speed * 0.98 + this.ball.maxSpeed * 0.02;
			}
			else
			{
				this.adjustBallAngle("horizontal");
			}
		}
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
			if (this.player1.score >= 11 ||
				this.player2.score >= 11)
				this.gameStatus = GameStatus.GAMEOVER;
			else
				this.gameStatus = GameStatus.NEWBALL;
			this.sendHUDUpdate();
		}
	}
}
