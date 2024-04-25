import { WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Consumer, Kafka, Producer, logLevel } from 'kafkajs';

import { GamePong } from './GamePong';
import { PlayerStatus } from './GamePong.enums';
import { PlayerRanked } from './GamePong.interfaces';

import { SockEventNames, PlayerInfo, IPlayerInfo, ISockConnectGame, MatchTypes } from './GamePong.communication';

@WebSocketGateway({ cors: true })
export class GameManager implements OnGatewayConnection, OnGatewayDisconnect
{
	private games: GamePong[];

	private matchQueue: PlayerRanked[];
	private matchInterval: any;

	private kafka: Kafka;
	private producer: Producer;
	private consumer: Consumer;
	private kafkaReady: Boolean = false;

	// @WebSocketServer() server: Server;

	constructor()
	{
		console.log("Setting up Games storage");
		this.games = [];
		this.matchQueue = [];

		console.log("Connecting to Kafka");
		this.setupKafka().then(() =>
		{
			console.log("Connected to Kafka");
			this.kafkaReady = true;
			// console.log("Creating test game");

			// this.producer.send(
			// {
			// 	topic:	"pongNewGame",
			// 	messages:	[{ value: JSON.stringify(
			// 	{
			// 		gameType:	"pong",
			// 		name1:		"localhost",
			// 		name2:		"10.11.1.6",
			// 	}),}]
			// });
		});
	}


	private async setupKafka()
	{
		this.kafka = new Kafka(
		{
			clientId:	'GameManager',
			brokers:		['kafka:29092'],
			logLevel:	logLevel.ERROR,
		});
		this.producer = this.kafka.producer();
		await this.producer.connect();
		this.consumer = this.kafka.consumer( { groupId: 'game-consumer' });
		await this.consumer.connect();

		await this.consumer.subscribe({ topic: "pongNewGame" });
		await this.consumer.subscribe({ topic: "game_end" });

		await this.consumer.subscribe({ topic: PlayerInfo.TOPIC });
		await this.consumer.subscribe({ topic: PlayerInfo.REPLY });


		await this.consumer.run(
		{
			eachMessage: async({ topic, partition, message }) =>
			{
				switch (topic)
				{
					case "pongNewGame":
						this.createNewGame("pong", message.value.toString());
						break ;
					case PlayerInfo.TOPIC://fake API
						let msg = JSON.parse(message.value.toString());
						let data: IPlayerInfo;

						data.playerID = msg.playerID;
						data.playerName = msg.playerID;
						if (msg.playerID === "localhost")
							data.playerRank = 10;
						else if (msg.playerID = "10.11.1.6")
							data.playerRank = 4;
						else
							data.playerRank = 23;
						this.producer.send(
						{
							topic:	PlayerInfo.REPLY,
							messages:	[{ value: JSON.stringify(data),}],
						});
						break ;
					case PlayerInfo.REPLY:
						this.setPlayerInfo(message.value.toString());
						// this.setPlayerName(message.value.toString());
						// this.setPlayerRank(message.value.toString());
						break ;
					case "game_end":
						this.removeGame(message.value.toString());
						break ;
					default:
						console.error("Unknown topic:", topic);
						break ;
				}
			}
		});
	}

/* ************************************************************************** *\

	Socket.io

\* ************************************************************************** */

handleConnection(client: any, ...args: any[])
{
	console.log("Client connecting: ", client.id);
	this.sendConnectionConfirmation(client);
}

sendConnectionConfirmation(client: any)
{
	if (client.connected)
	{
		if (this.kafkaReady)
		{
			if (client.emit)
				client.emit(SockEventNames.SERVERREADY, 'Connected to WebSocket server');
			else
				console.error("Error: socket.io.emit to client.id: ", client.id);
		}
		else
			setTimeout(() => this.sendConnectionConfirmation(client), 1000);
	}
	else
		console.error("Error Client ", client.id, "not connected.");
}

handleDisconnect(client: any)
{
	console.log("Client disconnecting: ", client.id);
	this.setPlayerToDisconnect(client.id);
	this.rmPlayerFromMatchMaking(client.id);
	// let game: GamePong = this.findGameByClientId(client.id);
	// if (game)
	// {
	// 	let player:	any;
	// 	if (game.player1.client === client)
	// 		player = game.player1;
	// 	else if (game.player2.client === client)
	// 		player = game.player2;
	// 	else
	// 		return ;
	// 	player.client = undefined;
	// 	player.status = PlayerStatus.DISCONNECTED;
	// 	// game.sendHUDUpdate();
	// }
	// else
	// 	console.log("game not found");
}


@SubscribeMessage(SockEventNames.CONNECTGAME)
handleConnectPong(client: object, message: string): boolean
{
	const msg: ISockConnectGame = JSON.parse(message)

	let gameID: GamePong = this.findGameByPlayerId(msg.playerID);
	if (gameID)
	{
		gameID.connectPlayer(msg.playerID, client);
		return (true);
	}
	else if (msg.matchType !== undefined)
	{
		switch (msg.matchType)
		{
			case MatchTypes.SOLO:
				gameID = new GamePong(msg.playerID, null, this.producer, this.consumer);
				this.games.push(gameID);
				gameID.connectPlayer(msg.playerID, client);
				break ;
			case MatchTypes.LOCAL:
				console.error("requested unsupported game type");
				break ;
			case MatchTypes.PAIR:
				// console.error("Error: pair not found for: ", msg.playerID);
				return (false);
			case MatchTypes.MATCH:
				console.log("finding match!");
				this.addPlayerToMatchMaking(msg.playerID, client);
				return (true);
			default:
				console.error("ErrorL Unknown matchType", msg.matchType);
				break ;
		}
	}
	return (false);
}

// @SubscribeMessage("findPongPaired")
// handleFindPongPair(client: object, message: string): boolean
// {
// 	console.log("remove this function!");
// 	return (false);
// 		// console.log("paired game found");
// 	// else
// 	// 	console.log("no game found");
// 	// console.log("find pair triggered!");
// }

// @SubscribeMessage("connectMSG")
// handleUserPackage(client: any, message: string)
// {
// 	console.log("Received: ", message);
// 	const msg = JSON.parse(message);
// 	let gameID: GamePong = this.findGameByName(msg.id);
// 	switch (msg.msgType)
// 	{
// 		case "pongSolo":
// 			if (gameID)
// 				gameID.connectPlayer(msg.id, client);
// 			else
// 			{
// 				gameID = new GamePong(msg.id, null, this.producer, this.consumer); 
// 				this.games.push(gameID);
// 				gameID.connectPlayer(msg.id, client);
// 			}
// 			break ;
// 		case "pongMatch":
// 			this.findGameByClientId(client.id);
// 			console.log("lets find a match at some point!");
// 			break ;
// 		case "pongPair":
// 			console.log("lets find a pair at some point!");
// 			break ;
// 		default:
// 			console.error("Error: unknown msgType: ", msg.msgType);
// 			break ;
// 	}
// 	return ;
// }

/* ************************************************************************** *\

	Kafka

\* ************************************************************************** */

	private setPlayerInfo(message: string)
	{
		const data: IPlayerInfo = JSON.parse(message);

		if (!data.playerID)
			return ;
		if (data.playerName)
			for (const game of this.games)
			{
				if (game.player1.id === data.playerID ||
					game.player2.id === data.playerID)
					game.setPlayerName(data.playerID, data.playerName);
			}
		if (data.playerRank)
			for (let i: number = 0; i < this.matchQueue.length; ++i)
				if (this.matchQueue[i].id === data.playerID)
					this.matchQueue[i].rank = data.playerRank;
	}

/* ************************************************************************** *\

	Match Making

\* ************************************************************************** */

	private addPlayerToMatchMaking(id: string, client: object)
	{
		if (this.matchQueue.findIndex(player => player.id === id) === -1)
		{
			let player: PlayerRanked = {
				client:	client,
				id:		id,
				rank:	0,
				time:	0,
			};
			this.matchQueue.push(player);
		}

		const data: IPlayerInfo = {playerID: id,};
		this.producer.send(
		{
			topic:	PlayerInfo.TOPIC,
			messages:	[{ value: JSON.stringify(data),}],
		});

		if (this.matchQueue.length > 1 && !this.matchInterval)
			this.matchInterval = setInterval(this.matchLoop.bind(this), 1000);
	}

	private	setPlayerRank(message: string)
	{
		const msg = JSON.parse(message);
		
		const index: number = this.matchQueue.findIndex(player => player.id === msg.playerID);
		if (index != -1)
			this.matchQueue[index].rank = msg.playerRank;
		this.matchQueue.sort((a, b) => a.rank - b.rank);

	}

	private printMatchList()
	{
		for (let i: number = 0; i < this.matchQueue.length; ++i)
			console.log(i, this.matchQueue[i].id, this.matchQueue[i].rank);
	}

	private matchLoop()
	{
		for (let i: number = 0; i < this.matchQueue.length - 1; ++i)
		{
			console.log(this.matchQueue[i].rank, "+", this.matchQueue[i].time, ">=", 
				this.matchQueue[i + 1].rank, "-", this.matchQueue[i + 1].time);
			if (this.matchQueue[i].rank + this.matchQueue[i].time >= 
				this.matchQueue[i + 1].rank - this.matchQueue[i + 1].time)
			{
				let gameID = new GamePong(this.matchQueue[i].id, this.matchQueue[i + 1].id, this.producer, this.consumer);
				this.games.push(gameID);
				gameID.connectPlayer(this.matchQueue[i].id, this.matchQueue[i].client);
				gameID.connectPlayer(this.matchQueue[i + 1].id, this.matchQueue[i + 1].client);
				this.rmPlayerFromMatchMaking(gameID.player1.id);
				this.rmPlayerFromMatchMaking(gameID.player2.id);
				break ;
			}
		}
		for (let i: number = 0; i < this.matchQueue.length; ++i)
			++this.matchQueue[i].time;
	}

	private	rmPlayerFromMatchMaking(id: string)
	{
		let index:	number;

		while ((index = this.matchQueue.findIndex(id => id === id)) !== -1)
		{
			console.log("removing", this.matchQueue[index].id);
			this.matchQueue.splice(index, 1)[0];
		}
		if (this.matchQueue.length <= 1)
			clearInterval(this.matchInterval);

		// const index: number = this.matchQueue.findIndex(id => id === id);
		// console.log("removing ", this.matchQueue[index].id, " / ", id);
		// if (index !== -1)
		// 	this.matchQueue.splice(index, 1)[0];
		// if (this.matchQueue.length <= 1)
		// 	clearInterval(this.matchInterval);
	}

/* ************************************************************************** *\

	Game Operations

\* ************************************************************************** */

	private createNewGame(type: string, message: string)
	{
		const msg: any = JSON.parse(message);
		switch(msg.gameType)
		{
			case "pong":
				this.games.push(new GamePong(msg.name1, msg.name2, this.producer, this.consumer));
				break ;
			default:
				console.error("Unknown gametype: ", msg.gameType);
				break ;
		}
	}

	private	removeGame(message: string)
	{
		const msg:	any = JSON.parse(message);

		let gameID: GamePong = this.findGameByPlayerId(msg.player1ID);
		const index: number = this.games.findIndex(game => game === gameID);
		if (index !== -1)
			this.games.splice(index, 1)[0];
	}

	private findGameByClientId(id: string): GamePong | null
	{
		for (const game of this.games)
			if ((game.player1.client && game.player1.client.id === id) ||
				(game.player2.client && game.player2.client.id === id))
				return (game);
		return (null);
	}

	private findGameByPlayerId(id: any)
	{
		for (const game of this.games)
			if (game.player1.id === id ||
				game.player2.id === id)
				return (game);
		return (null);
	}

	private setPlayerToDisconnect(id: string)
	{
		for (const game of this.games)
		{
			if (game.player1.client && game.player1.client.id === id)
			{
				game.player1.client = undefined;
				game.player1.status = PlayerStatus.DISCONNECTED;
			}
			if (game.player2.client && game.player2.client.id === id)
				{
					game.player2.client = undefined;
					game.player2.status = PlayerStatus.DISCONNECTED;
				}
		}
	}

	// private findGameByName(name: string): GamePong | null
	// {
	// 	for (const game of this.games)
	// 		if (game.player1.name === name ||
	// 			game.player2.name === name)
	// 		{
	// 			return (game);
	// 		}
	// 	return (null);
	// }

	// private findGameByClient(client: any): GamePong | null
	// {
	// 	for (const game of this.games)
	// 		if (game.player1.client === client ||
	// 			game.player2.client === client)
	// 		{
	// 			return (game);
	// 		}
	// 	return (null);
	// }

}
