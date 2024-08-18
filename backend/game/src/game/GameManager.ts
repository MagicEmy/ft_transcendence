import { Socket } from 'socket.io';
import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage } from '@nestjs/websockets';
import { Consumer, Kafka, Producer, } from 'kafkajs';

import { GamePlayer } from './GamePlayer';
import { IGame } from "./IGame"
import { GamePong } from './GamePong';
import { MatchMaker } from './GameMatchMaker';
import { SocketCommunication, KafkaCommunication  } from './GamePong.communication';

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
			clientId:	KafkaCommunication.Settings.CLIENTID,
			brokers:	[KafkaCommunication.Settings.BROKERS],
			logLevel:	KafkaCommunication.Settings.LOGLEVEL,
		});
		this.producer = this.kafka.producer();
		await this.producer.connect();
		this.consumer = this.kafka.consumer({ groupId: KafkaCommunication.Settings.GROUPID });
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
		await this.consumer.subscribe({ topic: KafkaCommunication.NewGame.TOPIC });
		await this.consumer.subscribe({ topic: KafkaCommunication.PlayerInfo.REPLY });
	}

	private kafkaListen(topic: any, partition: any, message: any): void
	{
		console.log(`received ${topic}/${message.value}`);
		switch (topic)
		{
			case KafkaCommunication.NewGame.TOPIC:
				const newGame: KafkaCommunication.NewGame.INewGame = JSON.parse(message.value);
				this.CreateGame(undefined, newGame.gameType, [newGame.matchType], [newGame.player1ID, newGame.player2ID]);
				break ;
			case KafkaCommunication.PlayerInfo.REPLY:
				this.SetPlayerInfo(JSON.parse(message.value));
				break ;
			default:
				console.error(`Error: Unhandled Kafka topic '${topic}'`);
				break ;
		}
	}

	public kafkaEmit(topic: string, message: string | null): void
	{
		this.producer.send(
		{
			topic:		topic,
			messages:	[{ value: message }],
		});
	}

	private SetPlayerInfo(info: KafkaCommunication.PlayerInfo.IPlayerInfo): void
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

	public handleConnection(client: Socket, ...args: any[]): void
	{
		console.log("Client connecting:", client.id);
		this.sendConnectionConfirmation(client);
	}

	private sendConnectionConfirmation(client: Socket): void
	{
		if (client.connected)
			if (this.kafkaReady)
			{
				if (client.emit)
					client.emit(SocketCommunication.ServerReady.TOPIC, "Connected to GameManager");
				else
					console.error("Error: can't socket.io.emit to client.id:", client.id);
			}
			else
				setTimeout(() => this.sendConnectionConfirmation(client), 1000);
		else
			console.error("Error: Client no longer connected:", client.id);
	}

	public handleDisconnect(client: Socket): void
	{
		console.log("Client disconnected:", client.id);
		this.removePlayer(this.FindPlayerObject(client));
	}

	@SubscribeMessage(SocketCommunication.UserPack.TOPIC)
	handlerUserPack(client: Socket, message: string): void
	{
		const msg: SocketCommunication.UserPack.IUserPack = JSON.parse(message);
		let player: GamePlayer = new GamePlayer(client, msg.playerID);
		this.players.push(player);
		player.name = msg.playerName;

		const game: IGame | null = this.FindExistingGame(player);
		if (game)
			game.AddPlayer(player);
		else
			this.EmitMenu(client);
	}

	@SubscribeMessage(SocketCommunication.RequestMenu.TOPIC)
	handelerRequestMenu(client: Socket): void
	{
		this.EmitMenu(client);
	}

/* ************************************************************************** *\

	Menu

\* ************************************************************************** */

	public EmitMenu(client: Socket): void
	{
		const menuJson = { rows: [] };

		menuJson.rows.push(GamePong.GetMenuRowJson());
		menuJson.rows.push(MatchMaker.GetMenuRowJson());
		client.emit(SocketCommunication.RequestMenu.REPLY, JSON.stringify(menuJson));
	}

// class GameMenu
// {
// 	public name:	string;
// 	public flag:	string;
// 	public active:	boolean;
// 	public up:	GameMenu | null;
// 	public down:	GameMenu | null;
// 	public left:	GameMenu | null;
// 	public right:	GameMenu | null;

// 	private constructor(name: string, flag: string)
// 	{
// 		this.name = name;
// 		this.flag = flag;
// 		this.active = false;
// 		this.up = null;
// 		this.down = null;
// 		this.left = null;
// 		this.right = null;
// 	}

// 	public ToJson(): string
// 	{
// 		const nodes: any[] = [];
// 		let current: GameMenu | null = this;
// 		console.log("Creating nodes");
// 		while (current)
// 		{
// 			for (let row: any; row; row = row.down)
// 			{
// 				nodes.push(
// 				{
// 					name:	row.name,
// 					flag:	row.flag,
// 					active:	row.active,
// 					up:		row.up,
// 					down:	row.down,
// 					left:	row.left,
// 					right:	row.right,
// 				});
// 				console.log("added node");
// 			}
// 			current = current.right;
// 		}
// 		return JSON.stringify(nodes);
// 	}
// }

/* ************************************************************************** *\

	Games

\* ************************************************************************** */

	public CreateGame(player: GamePlayer, game: string, data: string[], players: string[]): IGame | null
	{
		console.log(`Trying to create ${game}`);
		let gameInstance: IGame;

		try
		{
			switch (game.toUpperCase())
			{
				case GamePong.GetFlag().toUpperCase():
					gameInstance = new GamePong(data, players);

					break ;
				case MatchMaker.GetFlag().toUpperCase():
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
		gameToRemove.ClearGame();
		const index: number = this.games.findIndex(game => game === gameToRemove);
		if (index  != -1)
			this.games.splice(index, 1)[0];
	}

/* ************************************************************************** *\

	Players

\* ************************************************************************** */

	private FindPlayerObject(client: Socket): GamePlayer | null
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
