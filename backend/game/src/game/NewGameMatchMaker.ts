import { GameManager } from "./NewGameManager";
import { GamePlayer } from "./GamePlayer";
import { IGame } from "./IGame";
import { GamePong } from "./NewGamePong";
import { IPlayerRanked } from './GamePong.interfaces';
import { KafkaCommunication, SocketCommunication } from "./GamePong.communication";

export class MatchMaker implements IGame
{
	private static instance: MatchMaker | undefined;

	private static gameFlag: string = "MATCH";
	private static matchQueue: IPlayerRanked[] = [];
	private static matchInterval: any;
	private static timeInterval: number = 1000;

	private constructor()
	{}

	public static GetInstance(): MatchMaker
	{
		if (MatchMaker.instance === undefined)
			MatchMaker.instance = new MatchMaker();
		return (MatchMaker.instance);
	}

	public AddPlayer(player: GamePlayer): boolean
	{
		var id: any = player.getId()
		var rank: number = player.rank? player.rank : -1;
		if (MatchMaker.matchQueue.findIndex(playerQueue => playerQueue.id === id) === -1)
		{
			let newPlayer: IPlayerRanked = {
				player: player,
				id:		id,
				rank:	rank,
				time:	0,
			};
			MatchMaker.matchQueue.push(newPlayer);
			// MatchMaker.matchQueue.push({player: undefined, id: id, rank: 5, time: 0});
			MatchMaker.matchQueue.sort((a, b) => a.rank - b.rank);
			// MatchMaker.PrintMatchList();
		}

		else
			console.error(`Error: Player [${player.getId()}] is already in MatchMaker.`);

		if (MatchMaker.matchQueue.length > 0 &&
			(!MatchMaker.matchInterval || MatchMaker.matchInterval._idleTimeout === -1))
			MatchMaker.matchInterval = setInterval(MatchMaker.MatchLoop.bind(MatchMaker), MatchMaker.timeInterval);
		return (true);
	}

	public static UpdatePlayer(player: KafkaCommunication.PlayerInfo.IPlayerInfo): void
	{
		if (player.playerRank)
			for (let i: number = 0; i < MatchMaker.matchQueue.length; ++i)
				if (MatchMaker.matchQueue[i].id === player.playerID)
					MatchMaker.matchQueue[i].rank = player.playerRank;
	}

	private static PrintMatchList(): void
	{
		for (let i: number = 0; i < MatchMaker.matchQueue.length; ++i)
			console.log(i, MatchMaker.matchQueue[i].id, MatchMaker.matchQueue[i].rank, MatchMaker.matchQueue[i].time);
	}

	public PlayerIsInGame(player: GamePlayer): boolean
	{
		// const id: any = player.getId();
		// if (MatchMaker.matchQueue.findIndex(playerQueue => playerQueue.id === id) === -1)
		// 	return (false);
		return (true);
	}

	public static RemovePlayer(id: string)
	{
		let index: number;
		while ((index = MatchMaker.matchQueue.findIndex(id => id === id)) !== -1)
			MatchMaker.matchQueue.splice(index, 1)[0];

		if (MatchMaker.matchQueue.length < 1)
			clearInterval(MatchMaker.matchInterval);
	}

	ClearGame(): void
	{
		MatchMaker.matchQueue = [];
		clearInterval(MatchMaker.matchInterval);
	}

	private static MatchLoop()
	{
		// console.log("checking for match general");
		for (let i: number = 0; i < MatchMaker.matchQueue.length - 1; ++i)
		{
			// console.log(`checking ${MatchMaker.matchQueue[i].player}/${MatchMaker.matchQueue[i + 1].player}`);
			if (Math.abs(MatchMaker.matchQueue[i].rank - MatchMaker.matchQueue[i + 1].rank) <=
				MatchMaker.matchQueue[i].time + MatchMaker.matchQueue[i + 1].time)
			{
				// console.log("Found a match");
				const player1: IPlayerRanked = MatchMaker.matchQueue[i];
				const player2: IPlayerRanked = MatchMaker.matchQueue[i + 1];
				const game: IGame = GameManager.getInstance().CreateGame(player1.player, 
													GamePong.GetFlag(), 
													["pair", "retro"],
													[player1.id, player2.id]);
				// console.log(`match received game ${game}`);
				MatchMaker.AddPlayerToGameAndRemoveFromList(game, player1.player);
				MatchMaker.AddPlayerToGameAndRemoveFromList(game, player2.player);
				break ;
			}
		}

		MatchMaker.matchQueue.forEach(player =>
		{
			player.time += MatchMaker.timeInterval / 1000;
			MatchMaker.UpdateClient(player);
		});
	}

	private static AddPlayerToGameAndRemoveFromList(game: IGame, player: GamePlayer): void
	{
		try
		{
			console.log(`game ${game}`);
			if (!game.AddPlayer(player))
				console.error(`Error adding ${player.getId()} to game.`);
		}
		catch (error)
		{
			console.error(`Exception adding ${player.getId()} to game.`);
		}
		MatchMaker.RemovePlayer(player.getId());
	}

	private static UpdateClient(player: IPlayerRanked)
	{
		if (player.player?.client?.emit)
		{
			const data: SocketCommunication.MatchMaker.IMatchMaker =
			{
				queue:	GamePong.GetFlag(),
				rank:	player.rank,
				time:	player.time,
			};
			player.player?.client?.emit(SocketCommunication.MatchMaker.TOPIC, JSON.stringify(data));
		}
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
