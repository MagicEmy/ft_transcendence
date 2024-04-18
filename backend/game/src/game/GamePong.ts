
interface	Player
{
	client:	any;
	name:	string;
	paddle: Paddle;
	status:	string;
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
	player1:	Player;
	player2:	Player;

	constructor(player1: string, player2: string)
	{
		this.player1 = {
			client: undefined,
			name:	player1,
			paddle: {posX: 1/23, posY: 0.5, width: 0.01, height: 0.1, speed: 0.005},
			status:	PlayerStatus.CONNECTING,
			button:	{},
		};
		this.player2 = {
			client: undefined,
			name:	player2,
			paddle: {posX: 22/23, posY: 0.5, width: 0.01, height: 0.1, speed: 0.005},
			status:	PlayerStatus.CONNECTING,
			button:	{},
		}
		console.log("Created New Pong game: ", this.player1.name, " vs ", this.player2.name);
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
		console.log(player.name, "[", key.name, "]\t", player.button[key.code]);
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
				},
				Player2:
				{
					posX:	this.player2.paddle.posX,
					posY:	this.player2.paddle.posY,
					height:	this.player2.paddle.height,
					width:	this.player2.paddle.width,
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
}
