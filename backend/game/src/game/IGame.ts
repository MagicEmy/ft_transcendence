import { GamePlayer } from "./GamePlayer";

export abstract class IGame
{
	public abstract AddPlayer(player: GamePlayer): boolean;
	public abstract PlayerIsInGame(player: GamePlayer): boolean;
	// public abstract PlayerDisconnect(player: GamePlayer)
	public abstract clearGame(): void;
	
	// protected static gameFlag = "DEFAULT";
	// public static GetFlag(): string {return this.gameFlag};
	// public static GetMenuRowJson(): any
}
