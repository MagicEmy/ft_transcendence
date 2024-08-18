import { Socket } from 'socket.io';

import { GameManager } from "./NewGameManager";
import { GamePlayer } from "./GamePlayer";
import { IGame } from "./IGame";
import { GamePong } from "./NewGamePong";
import { IPlayerRanked } from './GamePong.interfaces';
import { KafkaCommunication, SocketCommunication } from "./GamePong.communication";

export class MatchMaker implements IGame
{
	private static instance: MatchMaker | undefined;

	private static LeaveHandlers: Map<Socket, (client: Socket) => void>;
	private static DisconnectHandlers: Map<Socket, (client: Socket) => void>;

	private static gameFlag: string = "MATCH";
	private static matchQueue: IPlayerRanked[];
	private static matchInterval: any;
	private static timeInterval: number;

	private constructor()
	{
		MatchMaker.matchQueue = [];
		MatchMaker.timeInterval = 1000;
		MatchMaker.LeaveHandlers = new Map<Socket, (client: Socket) => void>();
		MatchMaker.DisconnectHandlers = new Map<Socket, (client: Socket) => void>();
	}

	public static GetInstance(): MatchMaker
	{
		if (MatchMaker.instance === undefined)
			MatchMaker.instance = new MatchMaker();
		return (MatchMaker.instance);
	}

/* ************************************************************************** *\

	Add and Remove Player

\* ************************************************************************** */

	public AddPlayer(player: GamePlayer): boolean
	{
		var id: any = player.getId()
		var rank: number = player.rank? player.rank : -1;
		if (MatchMaker.matchQueue.findIndex(playerQueue => playerQueue.id === id) === -1)
		{
			MatchMaker.AddPlayerToQueue(player);
			MatchMaker.AddHandlers(player.getClient(), player.getId());
			MatchMaker.matchQueue.sort((a, b) => a.rank - b.rank);

			// let newPlayer: IPlayerRanked = {
			// 	player: player,
			// 	id:		id,
			// 	rank:	rank,
			// 	time:	0,
			// };
			// MatchMaker.matchQueue.push(newPlayer);
			// MatchMaker.matchQueue.sort((a, b) => a.rank - b.rank);
		}
		else
			console.error(`Error: Player [${player.getId()}] is already in MatchMaker.`);

		if (MatchMaker.matchQueue.length > 0 &&
			(!MatchMaker.matchInterval || MatchMaker.matchInterval._idleTimeout === -1))
			MatchMaker.matchInterval = setInterval(MatchMaker.MatchLoop.bind(MatchMaker), MatchMaker.timeInterval);
		return (true);
	}

	private static AddPlayerToQueue(player: GamePlayer): void
	{
		const id: any = player.getId();
		const newPlayer: IPlayerRanked = 
		{
			player:	player,
			id:		player.getId(),
			rank:	player.rank ? player.rank : -1,
			time:	0,
		};
		MatchMaker.matchQueue.push(newPlayer);
		// MatchMaker.matchQueue.sort((a, b) => a.rank - b.rank);
	}

/* ************************************************************************** *\

	Socket.io

\* ************************************************************************** */

	private static AddHandlers(client: Socket, playerID: any): void
	{
		var handler: any;
		
		handler = () => MatchMaker.HandlerLeaveMatchmaker(client, playerID);
		MatchMaker.LeaveHandlers.set(client, handler);
		client.on(SocketCommunication.LeaveMatchMaker.TOPIC, handler);

		handler = () => MatchMaker.HandlerDisconnect(client, playerID);
		MatchMaker.DisconnectHandlers.set(client, handler);
		client.on("disconnect", handler);
	}

	private static HandlerDisconnect(client: Socket, playerID: any): void
	{
		MatchMaker.RemoveListeners(client);
		MatchMaker.RemovePlayer(playerID);
	}

	private static HandlerLeaveMatchmaker(client: Socket, playerID: any): void
	{
		MatchMaker.RemoveListeners(client);
		MatchMaker.RemovePlayer(playerID);
	}

	private static RemoveListeners(client: Socket): void
	{
		var handler: any;

		handler = MatchMaker.LeaveHandlers.get(client);
		if (handler)
		{
			client.off(SocketCommunication.LeaveMatchMaker.TOPIC, handler);
			MatchMaker.LeaveHandlers.delete(client);
		}

		handler = MatchMaker.DisconnectHandlers.get(client);
		if (handler)
		{
			client.off("disconnect", handler);
			MatchMaker.DisconnectHandlers.delete(client);
		}
	}

	private static RemoveAllListeners(): void
	{
		MatchMaker.LeaveHandlers.forEach((handler, client) =>
		{
			client.removeAllListeners(SocketCommunication.LeaveMatchMaker.TOPIC);
			MatchMaker.LeaveHandlers.delete(client);
		});

		MatchMaker.DisconnectHandlers.forEach((handler, client) =>
		{
			client.off("disconnect", handler);
			MatchMaker.DisconnectHandlers.delete(client);
		});
	}

	public static RemovePlayer(playerID: string): void
	{
		let index: number;

		MatchMaker.PrintMatchList();
		while ((index = MatchMaker.matchQueue.findIndex(id => id.id === playerID)) !== -1)
			MatchMaker.matchQueue.splice(index, 1)[0];

		if (MatchMaker.matchQueue.length < 1)
			clearInterval(MatchMaker.matchInterval);
		MatchMaker.PrintMatchList();
	}

	ClearGame(): void
	{
		MatchMaker.matchQueue = [];
		MatchMaker.RemoveAllListeners();
		clearInterval(MatchMaker.matchInterval);
	}


/* ************************************************************************** *\

	MatchLoop

\* ************************************************************************** */

	private static MatchLoop()
	{
		for (let i: number = 0; i < MatchMaker.matchQueue.length - 1; ++i)
		{
			if (Math.abs(MatchMaker.matchQueue[i].rank - MatchMaker.matchQueue[i + 1].rank) <=
				MatchMaker.matchQueue[i].time + MatchMaker.matchQueue[i + 1].time)
			{
				const player1: IPlayerRanked = MatchMaker.matchQueue[i];
				const player2: IPlayerRanked = MatchMaker.matchQueue[i + 1];
				const game: IGame = GameManager.getInstance().CreateGame(player1.player, 
													GamePong.GetFlag(), 
													["pair", "retro"],
													[player1.id, player2.id]);
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
			if (!game.AddPlayer(player))
				console.error(`Error adding ${player.getId()} to game.`);
		}
		catch (error)
		{
			console.error(`Exception adding ${player.getId()} to game.`);
		}
		MatchMaker.RemovePlayer(player.getId());
		MatchMaker.RemoveListeners(player.getClient());
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

/* ************************************************************************** *\

	Util

\* ************************************************************************** */

private static PrintMatchList(): void
{
	console.log(`Matchlist[${MatchMaker.matchQueue.length}]`);
	for (let i: number = 0; i < MatchMaker.matchQueue.length; ++i)
		console.log(i, MatchMaker.matchQueue[i].id, MatchMaker.matchQueue[i].rank, MatchMaker.matchQueue[i].time);
}

public PlayerIsInGame(player: GamePlayer): boolean
{
	const id: any = player.getId();
	if (MatchMaker.matchQueue.findIndex(playerQueue => playerQueue.id === id) === -1)
		return (false);
	return (true);
}

/* ************************************************************************** *\

	Menu

\* ************************************************************************** */
	
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
