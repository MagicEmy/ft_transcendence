import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage } from '@nestjs/websockets';
import { Consumer, Kafka, Producer, logLevel } from 'kafkajs';

import { IGame } from "./IGame"
import { GamePlayer } from './GamePlayer';
import { SockEventNames } from './GamePong.communication';
import { GamePong } from './NewGamePong';

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
				this.kafkaListen();
			}
		}
		)
	}

	private async kafKaSubscribe(): Promise<void>
	{
	}

	private kafkaListen(): void
	{
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

		client.emit("PlayerReady");
	}

/* ************************************************************************** *\

	Games

\* ************************************************************************** */

	public PlayGame(player: GamePlayer, mode: string, type: string, data: string)
	{
		switch (mode)
		{
			case "solo":
				this.PlayGameSolo(player, type, data);
				break;
			case "local":
				console.log("time to play solo");
				break;
			case "match":
				console.log("time to find a match!");
				break;
			default:
				console.error(`Error: Unknown game mode:`, mode);
				break;
		}
	}

	private PlayGameSolo(player: GamePlayer, type: string, data: string)
	{
		var game: IGame;
		switch (type)
		{
			case "pong":
				const dataPack = { IDs: [player.getId()] };
				game = new GamePong(type, JSON.stringify(dataPack));
				break ;
			default:
				console.error(`Error: Unknown game type:`, type);
				return ;
		}
		if (!game.AddPlayer(player))
			console.error("Failed to add player");
	}

	public FindExistingGame(player: GamePlayer): boolean
	{
		for (const game of this.games)
			if (game.PlayerIsInGame(player))
			{
				return (true);
			}
		return (false);
	}

	public removeGame(gameToRemove: IGame): void
	{
		gameToRemove.clearGame();
		const index: number = this.games.findIndex(game => game === gameToRemove);
		if (index  != -1)
			this.games.splice(index, 1)[0];
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
