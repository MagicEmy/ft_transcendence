
interface	Player
{
	client:	any;
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

enum	PlayerStatus
{
	DISCONNECTED = "Disconnected",
	CONNECTING = "Connecting",
	WAITING = "Waiting",
	NOTREADY = "Press Space to Start",
	READY = "Ready",
	PLAYING = ""
}

enum	GameStatus
{
	WAITING,
	START,
	NEWBALL,
	PLAYING,
	GAMEOVER,
}

export class GamePong
{
	private	gameStatus:	GameStatus;
	private loopInterval:	any;
	player1:	Player;
	player2:	Player;

	constructor(player1: string, player2: string | null)
	{
		this.gameStatus = GameStatus.WAITING;
		this.player1 = {
			client: undefined,
			name:	player1,
			paddle: {posX: 1/23, posY: 0.5, width: 0.01, height: 0.1, speed: 0.005},
			status:	PlayerStatus.CONNECTING,
			score:	0,
			button:	{},
		};
		this.player2 = {
			client: undefined,
			name:	player2,
			paddle: {posX: 22/23, posY: 0.5, width: 0.01, height: 0.1, speed: 0.005},
			status:	PlayerStatus.CONNECTING,
			score:	0,
			button:	{},
		}
		if (player2 === null)
		{
			this.player2.status = PlayerStatus.READY;
		}
		this.loopInterval = setInterval(this.gameLoop.bind(this), 16);
		console.log("Created New Pong game: ", this.player1.name, " vs ", this.player2.name);
	}

	private gameLoop()
	{
		this.updatePaddle(this.player1);
		this.updatePaddle(this.player2);
		switch (this.gameStatus)
		{
			case GameStatus.WAITING:
				this.waitForPlayers();
				break ;
			default:
				break ;
		}
		// this.sendHUDUpdate(this.player1);
	}

	private waitForPlayers()
	{
		if (this.player1.status === PlayerStatus.WAITING &&
			this.player2.status === PlayerStatus.WAITING)
		{
			this.player1.status = PlayerStatus.NOTREADY;
			this.player2.status = PlayerStatus.NOTREADY;
			this.gameStatus = GameStatus.START;
		}
	}

	private	updatePaddle(player: Player)
	{
		let	newPos: number = player.paddle.posY;

		if (player.button[38])
			newPos -= player.paddle.speed;
		if (player.button[40])
			newPos += player.paddle.speed;

		if (newPos + player.paddle.height / 2 > 1)
			newPos = 1 - player.paddle.height / 2;
		else if (newPos - player.paddle.height / 2 < 0)
			newPos = player.paddle.height / 2;

		player.paddle.posY = newPos;
	}

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
		this.sendHUDUpdate(this.player1);
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
		if (player.client.emit)
		{
			const data =
			{
				Player1:
				{
					posX:	this.player1.paddle.posX,
					posY:	this.player1.paddle.posY,
					height:	this.player1.paddle.height,
					width:	this.player1.paddle.width,
					msg:	this.player1.status,
				},
				Player2:
				{
					posX:	this.player2.paddle.posX,
					posY:	this.player2.paddle.posY,
					height:	this.player2.paddle.height,
					width:	this.player2.paddle.width,
					msg:	this.player2.status,
				},
				Ball:
				{
					posX:	null,
					posY:	null,
					size:	null,
				},
			}
			player.client.emit("pong", JSON.stringify(data));
		}
	}

	private	sendHUDUpdate(player: Player)
	{
		console.log("emitting hud);");
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
				P2:	P2,
				P1name:	this.player1.name,
				P1score:	this.player1.score,
				P1status:	this.player1.status,
				P2name:	P2.name,
				P2score:	this.player2.score,
				P2status:	this.player2.status,
			}
			this.player1.client.emit("pongHUD", JSON.stringify(HUD));
		}
		if (this.player2.client && this.player2.client.emit)
		{
			const HUD =
			{
				P1:	P2,
				P2:	P1,
				P1name:	this.player2.name,
				P1score:	this.player2.score,
				P1status:	this.player2.status,
				P2name:	this.player1.name,
				P2score:	this.player1.score,
				P2status:	this.player1.status,
			}
			this.player2.client.emit("pongHUD", JSON.stringify(HUD));
		}
	}
}

