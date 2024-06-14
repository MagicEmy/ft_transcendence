import { GamePlayer } from "./GamePlayer";

export interface IGame
{
	AddPlayer(player: GamePlayer): boolean;
	PlayerIsInGame(player: GamePlayer): boolean;
	clearGame(): void;
}
