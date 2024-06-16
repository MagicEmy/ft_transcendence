import { GamePlayer } from "./GamePlayer";
import { IGame } from "./IGame";

export class MatchMaker implements IGame
{
	private static gameFlag: string = "MATCH";

	AddPlayer(player: GamePlayer): boolean
	{
		return (true);
	}

	PlayerIsInGame(player: GamePlayer): boolean
	{
		return (true);
	}

	clearGame(): void
	{

	}

	public static GetFlag(): string { return (MatchMaker.gameFlag); }

	public static GetMenuRowJson(): any
	{
		return {
			name: "Match Maker",
			flag: MatchMaker.gameFlag,
			options:
			[
				[
					{ name: "Pong", flag: "Pong" },
				],
			]
		};
	}
}