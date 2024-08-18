import { Socket } from 'socket.io';

import { GameManager } from "./NewGameManager";
import { IGame } from "./IGame";
import { KafkaCommunication, SocketCommunication } from "./GamePong.communication";

export class GamePlayer
{
	private client: Socket | null;
	private id:	string;
	public name: string;
	public rank: number;
	public status: string;
	public button: {[key: number]: boolean};

	constructor(client: Socket, id: string | null)
	{
		if (typeof(id) === "string")
			this.constructPlayer(client, id);
		else
			this.ConstructBot();
	}

	private constructPlayer(client: Socket, id: string): void
	{
		this.client = client;
		this.id = id;
		this.button = {};

		client.on(SocketCommunication.PlayGame.TOPIC, (message: string) => { this.handlerPlayGame(message); });
		client.on(SocketCommunication.Button.TOPIC, (data: string) => { this.handlerButtonEvent(data); });
		const player: KafkaCommunication.PlayerInfo.IPlayerInfo = {
			playerID:	id,
		}
		client.on("disconnect", () => { this.handlerDisconnect() ;});
		GameManager.getInstance().kafkaEmit(KafkaCommunication.PlayerInfo.TOPIC, JSON.stringify(player));
	}

	private ConstructBot(): void
	{
		this.client = null;
		this.id = "Bot";
		this.button = {};
		this.name = "Ponginator"
	}

	private handlerPlayGame(message: string): void
	{
		const msg: string[] = JSON.parse(message);
		console.log(`msg: ${msg[0]}/${msg}`);
		const gm: GameManager | null = GameManager.getInstance();
		if (gm !== null)
		{
			let gameInstance: IGame | null;
			gameInstance = gm.FindExistingGame(this);
			if (!gameInstance)
				gameInstance = gm.CreateGame(this, msg[0], msg.slice(1), [this.id]);
			if (gameInstance)
				gameInstance.AddPlayer(this);
			else
				console.error(`Failing to add player to game ${gameInstance}`);
		}
	}

	private handlerButtonEvent(data: string): void
	{
		const key: SocketCommunication.Button.IButton = JSON.parse(data);
		this.button[key.code] = (key.event === "keydown");
		// console.log(`${this.status}\t${key.code} ${key.event}`);
	}

	private handlerDisconnect(): void
	{
		this.client?.removeAllListeners();
	}

	public getClient(): any {return this.client}
	public getId(): any {return this.id}
}
