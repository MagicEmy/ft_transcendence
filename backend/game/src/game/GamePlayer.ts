import { SockEventNames } from "./GamePong.communication";
import { GameManager } from "./NewGameManager";

export class GamePlayer
{
	private client: any | null;
	private id:	any;
	public name: string;
	public rank: number;
	public status: string;
	public button: {[key: number]: boolean};

	constructor(client: any, id: any)
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
		const msg: any = JSON.parse(message);
		const gm: GameManager | null = GameManager.getInstance();
		if (gm !== null)
		{
			if (gm.FindExistingGame(this))
				return ;
			gm.PlayGame(this, msg.mode, msg.type, msg.data);
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
