import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage } from '@nestjs/websockets';
import { Consumer, Kafka, Producer, logLevel } from 'kafkajs';

import { IGame } from "./IGame"
import { GamePlayer } from './GamePlayer';
import { NewGame, PlayerInfo, IPlayerInfo, SockEventNames, INewGame, GameTypes, MatchTypes } from './GamePong.communication';
import { GamePong } from './NewGamePong';
import { MatchMaker } from './NewGameMatchMaker';

class GameMenu
{
	public name:	string;
	public flag:	string;
	public active:	boolean;
	public up:	GameMenu | null;
	public down:	GameMenu | null;
	public left:	GameMenu | null;
	public right:	GameMenu | null;

	private constructor(name: string, flag: string)
	{
		this.name = name;
		this.flag = flag;
		this.active = false;
		this.up = null;
		this.down = null;
		this.left = null;
		this.right = null;
	}
	
	public ToJson()
	{
		const nodes: any[] = [];
		let current: GameMenu | null = this;
		// while (current && current.up !== null)
		// 	current = current.up;
		// while (current && current.left !== null)
		// 	current = current.left;
		console.log("Creating nodes");
		while (current)
		{
			for (let row: any; row; row = row.down)
			{
				nodes.push(
				{
					name:	row.name,
					flag:	row.flag,
					active:	row.active,
					up:		row.up,
					down:	row.down,
					left:	row.left,
					right:	row.right,
				});
				console.log("added node");
			}
			current = current.right;
		}
		return JSON.stringify(nodes);
	}
}

@WebSocketGateway({ cors: true })
export class GameManager implements OnGatewayConnection, OnGatewayDisconnect
{
	private static instance: GameManager | null = null;

	private games: IGame[];
	private players: GamePlayer[];

	private kafka: Kafka;
	private producer: Producer;
	private consumer: Consumer;
	private kafkaReady: Boolean = false;

	public constructor()
	{
		console.log("Setting up Games storage...");
		this.games = [];
		console.log("Setting up Player storage...");
		this.players = [];
		console.log("Connecting to Kafka...");
		this.kafkaSetup().then(() =>
		{
			console.log("Connected to Kafka");
			this.kafkaReady = true;
			// let game: INewGame = {
			// 	gameType: GameTypes.PONG,
			// 	matchType: MatchTypes.PAIR,
			// 	player1ID: "lorem",
			// 	player2ID: "ipsum",
			// };
			// this.kafkaEmit(NewGame.TOPIC, JSON.stringify(game));
		});
		GameManager.instance = this;
	}

	public static getInstance(): GameManager | null
	{
		if (GameManager.instance === null)
			GameManager.instance = new GameManager();
		return (GameManager.instance);
	}
	
/* ************************************************************************** *\

	Kafka

\* ************************************************************************** */

	private async kafkaSetup(): Promise<void>
	{
		this.kafka = new Kafka(
		{
			clientId:	"GameManager",
			brokers:	['kafka:29092'],
			logLevel:	logLevel.ERROR,
		});
		this.producer = this.kafka.producer();
		await this.producer.connect();
		this.consumer = this.kafka.consumer({ groupId: 'game-consumer' });
		await this.consumer.connect();
		await this.kafKaSubscribe();
		await this.consumer.run(
		{
			eachMessage: async({topic, partition, message}) =>
			{
				this.kafkaListen(topic, partition, message);
			}
		}
		)
	}

	private async kafKaSubscribe(): Promise<void>
	{
		await this.consumer.subscribe({ topic: NewGame.TOPIC });
		await this.consumer.subscribe({ topic: PlayerInfo.REPLY });
	}

	private kafkaListen(topic: any, partition: any, message: any): void
	{
		console.log(`received ${topic}/${message.value}`);
		switch (topic)
		{
			case NewGame.TOPIC:
				const newGame: INewGame = JSON.parse(message.value);
				this.CreateGame(undefined, newGame.gameType, [newGame.matchType], [newGame.player1ID, newGame.player2ID]);
				break ;
			case PlayerInfo.REPLY:
				this.SetPlayerInfo(JSON.parse(message.value));
				break ;
			default:
				console.error(`Error: Unhandled Kafka topic '${topic}'`);
				break ;
		}
	}

	public kafkaEmit(topic: string, message: string | null)
	{
		this.producer.send(
		{
			topic:		topic,
			messages:	[{ value: message }],
		});
	}

	private SetPlayerInfo(info: IPlayerInfo): void
	{
		this.players.forEach(player =>
		{
			if (player.getId() === info.playerID)
			{
				if (info.playerName)
					player.name = info.playerName;
				if (info.playerRank)
					player.rank = info.playerRank;
			}
		});
	}

/* ************************************************************************** *\

Socket.io

\* ************************************************************************** */

	public handleConnection(client: any, ...args: any[])
	{
		console.log("Client connecting:", client.id);
		this.sendConnectionConfirmation(client);
	}

	private sendConnectionConfirmation(client: any)
	{
		if (client.connected)
			if (this.kafkaReady)
				if (client.emit)
					client.emit(SockEventNames.SERVERREADY, "Connected to GameManager");
				else
					console.error("Error: can socket.io.emit to client.id:", client.id);
			else
				setTimeout(() => this.sendConnectionConfirmation(client), 1000);
		else
			console.error("Error: Client no longer connected:", client.id);
	}

	public handleDisconnect(client: any)
	{
		console.log("Client disconnected:", client.id);
		this.removePlayer(this.FindPlayerObject(client));
	}

	@SubscribeMessage("UserPack")
	handlerUserPack(client: any, message: string): void
	{
		const msg: any = JSON.parse(message);
		let player: GamePlayer = new GamePlayer(client, msg.playerID);
		this.players.push(player);
		player.name = msg.playerName;

		this.EmitMenu(client);
	}

	@SubscribeMessage("RequestMenu")
	handelerRequestMenu(client: any): void
	{
		this.EmitMenu(client);
	}
	
	@SubscribeMessage("LeaveMatchMaker")
	handerLeaveMatchMaker(client: any, message: string): void
	{
		const msg: any = JSON.parse(message);

		MatchMaker.RemovePlayer(msg.playerID);
		this.EmitMenu(client);
	}

	// @SubscribeMessage("PlayGame")
	// handlerPlayGame(client: any, message: string): void
	// {
	// 	const msg: string[] = JSON.parse(message);
	// 	switch (msg[0])
	// 	{
	// 		case GamePong.GetFlag():
	// 			console.log("Pong requested");
	// 			break ;
	// 		case MatchMaker.GetFlag():
	// 			console.log("Matchmaker requested");
	// 			break ;
	// 		default:
	// 			console.error(`Error: Unknown target flag '${msg[0]}'`);
	// 			break ;
	// 	}
	// }

/* ************************************************************************** *\

	Menu

\* ************************************************************************** */

	private EmitMenu(client: any)
	{
		const menuJson = { rows: [] };

		menuJson.rows.push(GamePong.GetMenuRowJson());
		menuJson.rows.push(MatchMaker.GetMenuRowJson());
		client.emit("GameMenu", JSON.stringify(menuJson));
	}

/* ************************************************************************** *\

	Games

\* ************************************************************************** */

	public CreateGame(player: GamePlayer, game: string, data: string[], players: string[]): IGame | null
	{
		console.log(`Trying to create ${game}`);
		let gameInstance: IGame;
		try
		{
			switch (game)
			{
				case GamePong.GetFlag():
					console.log(`gameinstance before ${game}`);
					gameInstance = new GamePong(data, players);
					console.log(`gameinstance after ${game}`);

					break ;
				case MatchMaker.GetFlag():
					gameInstance = MatchMaker.GetInstance();
					break ;
				default:
					console.error(`Error: Unknown target flag: ${game}`);
					return (null);
			}
			this.games.push(gameInstance);
			console.log(`Creating Game ${gameInstance} for ${game}`);
			return (gameInstance);
		}
		catch (error)
		{
			console.error(`Error: Failed to create game: ${error.message}`);
			return (null);
		}
	}

	// public PlayGame(player: GamePlayer, mode: string, type: string, data: string)
	// {
	// 	switch (mode)
	// 	{
	// 		case "solo":
	// 			this.PlayGameSolo(player, type, data);
	// 			break;
	// 		case "local":
	// 			console.log("time to play solo");
	// 			break;
	// 		case "match":
	// 			console.log("time to find a match!");
	// 			break;
	// 		default:
	// 			console.error(`Error: Unknown game mode:`, mode);
	// 			break;
	// 	}
	// }

	// private PlayGameSolo(player: GamePlayer, type: string, data: string)
	// {
	// 	var game: IGame;
	// 	switch (type)
	// 	{
	// 		case "pong":
	// 			const dataPack = { IDs: [player.getId()] };
	// 			game = new GamePong(type, JSON.stringify(dataPack));
	// 			break ;
	// 		default:
	// 			console.error(`Error: Unknown game type:`, type);
	// 			return ;
	// 	}
	// 	if (!game.AddPlayer(player))
	// 		console.error("Failed to add player");
	// }

	public FindExistingGame(player: GamePlayer): IGame | null
	{
		for (const game of this.games)
			if (game.PlayerIsInGame(player))
			{
				return (game);
			}
		return (null);
	}

	public removeGame(gameToRemove: IGame): void
	{
		gameToRemove.clearGame();
		const index: number = this.games.findIndex(game => game === gameToRemove);
		if (index  != -1)
			this.games.splice(index, 1)[0];
		// this.games.filter
		// console.log(`There are ${this.games.length} games running`);
	}

/* ************************************************************************** *\

	Players

\* ************************************************************************** */

	private FindPlayerObject(client: any): GamePlayer | null
	{
		for (const player of this.players)
		{
			if (player.getId() === client.id)
				return (player);
		}
		return (null);
	}

	public removePlayer(playerToRemove: GamePlayer)
	{
		const index: number = this.players.findIndex(player => player === playerToRemove);
		if (index != -1)
			this.players.splice(index, 1)[0];
	}
}
