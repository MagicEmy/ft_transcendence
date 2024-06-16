import { SockEventNames } from "./GamePong.communication";
import { IGame } from "./IGame";
import { GameManager } from "./NewGameManager";

export class GamePlayer
{
	private client: any | null;
	private id:	string;
	public name: string;
	public rank: number;
	public status: string;
	public button: {[key: number]: boolean};

	constructor(client: any, id: string)
	{
		console.log("Creating player");
		this.client = client;
		this.id = id;
		this.button = {};

		client.on("PlayGame", (message: string) => { this.handlerPlayGame(message); });
		client.on(SockEventNames.BUTTON, (data: string) => { this.handlerButtonEvent(data); });
	}

	private handlerPlayGame(message: string)
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

	private handlerButtonEvent(data: string)
	{
		const key: any = JSON.parse(data);
		this.button[key.code] = (key.event === "keydown");
	}

	public getClient(): any {return this.client}
	public getId(): any {return this.id}
}
