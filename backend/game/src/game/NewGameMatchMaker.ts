import { GamePlayer } from "./GamePlayer";
import { IGame } from "./IGame";
import { Player, PlayerRanked } from './GamePong.interfaces';
import { IPlayerInfo, ISockRemoveMatch } from "./GamePong.communication";
import { GameManager } from "./NewGameManager";
import { GamePong } from "./NewGamePong";

export class MatchMaker implements IGame
{
	private static gameFlag: string = "MATCH";
	private static matchQueue: PlayerRanked[] = [];
	private static matchInterval: any;
	private static timeInterval: number = 1000;

	public AddPlayer(player: GamePlayer): boolean
	{
		var id: any = player.getId()
		var rank: number = player.rank? player.rank : -1;
		if (MatchMaker.matchQueue.findIndex(playerQueue => playerQueue.id === id) === -1)
		{
			let newPlayer: PlayerRanked = {
				client: player.getClient(),
				id:		id,
				rank:	rank,
				time:	0,
			};
			MatchMaker.matchQueue.push(newPlayer);
			MatchMaker.matchQueue.push({client: undefined, id: id, rank: 23, time: 0});
			MatchMaker.matchQueue.sort((a, b) => a.rank - b.rank);
		}
		else
			console.error(`Error: Player [${player.getId()}] is already in MatchMaker.`)

		if (MatchMaker.matchQueue.length > 0 &&
			(!MatchMaker.matchInterval || MatchMaker.matchInterval._idleTimeout === -1))
			MatchMaker.matchInterval = setInterval(MatchMaker.matchLoop.bind(MatchMaker), MatchMaker.timeInterval);
		return (true);
	}
	
	public static UpdatePlayer(player: IPlayerInfo): void
	{
		if (player.playerRank)
			for (let i: number = 0; i < MatchMaker.matchQueue.length; ++i)
				if (MatchMaker.matchQueue[i].id === player.playerID)
					MatchMaker.matchQueue[i].rank = player.playerRank;
	}

	private static printMatchList(): void
	{
		for (let i: number = 0; i < MatchMaker.matchQueue.length; ++i)
			console.log(i, MatchMaker.matchQueue[i].id, MatchMaker.matchQueue[i].rank, MatchMaker.matchQueue[i].time);
	}

	PlayerIsInGame(player: GamePlayer): boolean
	{
		// const id: any = player.getId();
		// if (MatchMaker.matchQueue.findIndex(playerQueue => playerQueue.id === id) === -1)
		// 	return (false);
		return (true);
	}

	private static RemovePlayer(id: string)
	{
		let index: number;
		while ((index = MatchMaker.matchQueue.findIndex(id => id === id)) !== -1)
			MatchMaker.matchQueue.splice(index, 1)[0];

		if (MatchMaker.matchQueue.length < 1)
			clearInterval(MatchMaker.matchInterval);
	}

	clearGame(): void
	{
		MatchMaker.matchQueue = [];
		clearInterval(MatchMaker.matchInterval);
	}

	private static matchLoop()
	{
		for (let i: number = 0; i < MatchMaker.matchQueue.length - 1; ++i)
		{
			if (Math.abs(MatchMaker.matchQueue[i].rank - MatchMaker.matchQueue[i + 1].rank) <=
				MatchMaker.matchQueue[i].time + MatchMaker.matchQueue[i + 1].time)
			{
				const player1: PlayerRanked = MatchMaker.matchQueue[i];
				const player2: PlayerRanked = MatchMaker.matchQueue[i + 1];
				GameManager.getInstance().CreateGame(new GamePlayer(player1.client, player1.id), 
													GamePong.GetFlag(), 
													["PongGameMatch", "retro"],
													[player1.id, player2.id]);
				MatchMaker.RemovePlayer(player1.id);
				MatchMaker.RemovePlayer(player2.id);
				break ;
			}
		}

		MatchMaker.matchQueue.forEach(player =>
		{
			player.time += MatchMaker.timeInterval / 1000;
			MatchMaker.UpdateClient(player);
		});
	}

	private static UpdateClient(player: PlayerRanked)
	{
		const data: ISockRemoveMatch = 
		{
			rank: player.rank,
			time: player.time,
		};

		console.error(`sending ${JSON.stringify(data)} to PongMatch`);

		if (player?.client?.emit)
			player.client.emit("PongMatch", JSON.stringify(data));
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