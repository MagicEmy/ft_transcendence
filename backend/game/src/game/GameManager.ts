import { WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Consumer, Kafka, Producer, logLevel } from 'kafkajs';
import { GamePong } from './GamePong';

@WebSocketGateway({ cors: true})
export class GameManager implements OnGatewayConnection, OnGatewayDisconnect
{
	private games: GamePong[];

	private kafka: Kafka;
	private producer: Producer;
	private consumer: Consumer;

	@WebSocketServer() server: Server;

	constructor()
	{
		console.log("Settig up Games storage");
		this.games = [];

		console.log("Connecting to Kafka");
		this.setupKafka().then(() =>
		{
			console.log("Connected to Kafka");
			console.log("Creating test game");
			this.producer.send(
			{
				topic:	"pongNewGame",
				messages:	[{ value: JSON.stringify(
				{
					gameType:	"pong",
					name1:		"localhost",
					name2:		"10.10.4.21",
				}),}]
			});
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

		await this.consumer.run(
		{
			eachMessage: async({ topic, partition, message }) =>
			{
				switch (topic)
				{
					case "pongNewGame":
						this.createNewGame("pong", message.value.toString());
						break ;
					default:
						console.error("Unknown topic:", topic);
						break ;
				}
			}
		});
	}

	private createNewGame(type: string, message: string)
	{
		const msg: any = JSON.parse(message);
		switch(msg.gameType)
		{
			case "pong":
				this.games.push(new GamePong(msg.name1, msg.name2));
				break ;
			default:
				console.error("Unknown gametype: ", msg.gameType);
				break ;
		}
	}

	private findGameByName(name: string): GamePong | null
	{
		for (const game of this.games)
			if (game.player1.name === name ||
				game.player2.name === name)
			{
				return (game);
			}
		return (null);
	}

	private findGameByClient(client: any): GamePong | null
	{
		for (const game of this.games)
			if (game.player1.client === client ||
				game.player2.client === client)
			{
				return (game);
			}
		return (null);
	}

	handleConnection(client: any, ...args: any[])
	{
		console.log('Client connected');
		client.emit('message', 'Connected to WebSocket server');
	}

	handleDisconnect(client: any)
	{
		console.log("Client disconnecting");
		let game: GamePong = this.findGameByClient(client.clientId);
		if (game)
		{
			let player:	any;
			if (game.player1.client === client)
				player = game.player1;
			else if (game.player2.client === client)
				player = game.player2;
			else
				return ;
			player.client = undefined;
			player.status = "Disconnected";
		}
		else
			console.log("game not found");
	}

	@SubscribeMessage("connectMSG")
	handleUserPackage(client: any, message: string)
	{
		console.log("Received: ", message);
		const msg = JSON.parse(message);
		let gameID: GamePong = this.findGameByName(msg.name);
		if (gameID)
		{
			switch (msg.msgType)
			{
				case "connection":
					if (gameID.connectPlayer(msg.name, client))
						console.log(gameID.player1.status, ": ", gameID.player1.name);
					else
						console.error("failed)");
					break ;
				case "pongInfo":
					console.log("Client is requesting image data");
					break ;
				default:
					console.error("Error: unknown msgType: ", msg.msgType);
					break ;
			}
		}
		else
		{
			client.emit("error", "did not find game");
		}
	}
}
